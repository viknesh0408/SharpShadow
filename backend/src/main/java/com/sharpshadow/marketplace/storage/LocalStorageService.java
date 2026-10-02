package com.sharpshadow.marketplace.storage;

import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    @Value("${sharpshadow.storage.local.upload-dir:./storage/uploads}")
    private String publicUploadDir;

    @Value("${sharpshadow.storage.local.private-dir:./storage/private}")
    private String privateUploadDir;

    @Value("${sharpshadow.storage.signing-secret:${sharpshadow.jwt.secret}}")
    private String signingSecret;

    private static final String LEAKED_PUBLIC_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private Path publicRoot;
    private Path privateRoot;

    @PostConstruct
    public void init() {
        if (signingSecret == null || signingSecret.trim().isEmpty()) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: Storage signing secret is not configured!");
        }
        if (LEAKED_PUBLIC_SECRET.equalsIgnoreCase(signingSecret.trim())) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: The old public leaked secret was detected for storage signing! Set a new secret.");
        }
        try {
            this.publicRoot = Paths.get(publicUploadDir).toAbsolutePath().normalize();
            this.privateRoot = Paths.get(privateUploadDir).toAbsolutePath().normalize();

            Files.createDirectories(publicRoot);
            Files.createDirectories(privateRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public FileMetadata uploadPrivate(MultipartFile file) {
        validatePrivateFile(file);
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset.psd");
            String extension = getFileExtension(originalFilename);
            String uuid = UUID.randomUUID().toString();
            String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

            Path targetFolder = this.privateRoot.resolve(uuid);
            Files.createDirectories(targetFolder);

            Path targetLocation = targetFolder.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = uuid + "/" + storedFileName;

            return FileMetadata.builder()
                    .originalFileName(originalFilename)
                    .storedFileName(storedFileName)
                    .fileUrl(relativePath)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .formattedSize(formatFileSize(file.getSize()))
                    .build();
        } catch (IOException ex) {
            throw new BadRequestException("Could not store private file: " + ex.getMessage());
        }
    }

    @Override
    public FileMetadata uploadPublic(MultipartFile file) {
        validatePublicFile(file);
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "preview.jpg");
            String extension = getFileExtension(originalFilename);
            String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

            Path targetLocation = this.publicRoot.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/uploads/" + storedFileName;

            return FileMetadata.builder()
                    .originalFileName(originalFilename)
                    .storedFileName(storedFileName)
                    .fileUrl(publicUrl)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .formattedSize(formatFileSize(file.getSize()))
                    .build();
        } catch (IOException ex) {
            throw new BadRequestException("Could not store public file: " + ex.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) return;
        try {
            if (fileUrl.startsWith("/uploads/")) {
                String fileName = fileUrl.replace("/uploads/", "");
                Path file = this.publicRoot.resolve(fileName).normalize();
                Files.deleteIfExists(file);
            } else {
                Path file = this.privateRoot.resolve(fileUrl).normalize();
                Files.deleteIfExists(file);
                if (file.getParent() != null && !file.getParent().equals(this.privateRoot)) {
                    Files.deleteIfExists(file.getParent());
                }
            }
        } catch (IOException ignored) {}
    }

    public String generateDownloadUrl(String relativePath, String originalFileName, long expiryMinutes) {
        return generateDownloadUrl(relativePath, originalFileName, 0L, expiryMinutes);
    }

    @Override
    public String generateDownloadUrl(String relativePath, String originalFileName, Long userId, long expiryMinutes) {
        long expiresAtEpoch = Instant.now().plusSeconds(expiryMinutes * 60).getEpochSecond();
        String uidStr = userId != null ? String.valueOf(userId) : "0";
        String payload = relativePath + ":" + uidStr + ":" + expiresAtEpoch;
        String signature = computeSignature(payload);

        String encodedFile = URLEncoder.encode(relativePath, StandardCharsets.UTF_8);
        String encodedName = URLEncoder.encode(originalFileName != null ? originalFileName : "sharpshadow-download.psd", StandardCharsets.UTF_8);
        String encodedSig = URLEncoder.encode(signature, StandardCharsets.UTF_8);

        return "/api/downloads/file?file=" + encodedFile + "&uid=" + uidStr + "&expires=" + expiresAtEpoch + "&filename=" + encodedName + "&sig=" + encodedSig;
    }

    public boolean verifySignature(String relativePath, Long userId, long expiresAtEpoch, String signature) {
        if (Instant.now().getEpochSecond() > expiresAtEpoch) {
            return false;
        }
        String uidStr = userId != null ? String.valueOf(userId) : "0";
        String payload = relativePath + ":" + uidStr + ":" + expiresAtEpoch;
        String expectedSignature = computeSignature(payload);
        return expectedSignature.equals(signature);
    }

    public boolean verifySignature(String relativePath, long expiresAtEpoch, String signature) {
        return verifySignature(relativePath, 0L, expiresAtEpoch, signature);
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        try {
            Path filePath = this.privateRoot.resolve(relativePath).normalize();
            if (!filePath.startsWith(this.privateRoot)) {
                throw new BadRequestException("Invalid file path traversal attempt");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on storage server");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found on storage server");
        }
    }

    @Override
    public String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }

    private String computeSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing signature", e);
        }
    }

    private void validatePublicFile(MultipartFile file) {
        validateBasic(file);
        String ext = getFileExtension(file.getOriginalFilename()).toLowerCase();
        java.util.Set<String> allowedExts = java.util.Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");
        if (!allowedExts.contains(ext)) {
            throw new BadRequestException("Only image uploads (JPEG, PNG, WEBP, GIF, SVG) are allowed for public files.");
        }

        // Magic byte verification for binary images
        try {
            byte[] header = new byte[12];
            int read = file.getInputStream().read(header);
            if (read >= 3 && ("jpg".equals(ext) || "jpeg".equals(ext))) {
                if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                    throw new BadRequestException("Corrupted or invalid JPEG file signature.");
                }
            } else if (read >= 8 && "png".equals(ext)) {
                if ((header[0] & 0xFF) != 0x89 || header[1] != 'P' || header[2] != 'N' || header[3] != 'G') {
                    throw new BadRequestException("Corrupted or invalid PNG file signature.");
                }
            } else if (read >= 3 && "gif".equals(ext)) {
                if (header[0] != 'G' || header[1] != 'I' || header[2] != 'F') {
                    throw new BadRequestException("Corrupted or invalid GIF file signature.");
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not read file contents for validation.");
        }
    }

    private void validatePrivateFile(MultipartFile file) {
        validateBasic(file);
        String ext = getFileExtension(file.getOriginalFilename()).toLowerCase();
        java.util.Set<String> blockedExts = java.util.Set.of(
                "exe", "bat", "cmd", "sh", "php", "phtml", "jsp", "asp", "aspx", "html", "htm", "js", "jar", "war", "py"
        );
        if (blockedExts.contains(ext)) {
            throw new BadRequestException("Executable or script file type is not permitted.");
        }
    }

    private void validateBasic(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }
        String fileName = file.getOriginalFilename();
        if (fileName != null && (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\"))) {
            throw new BadRequestException("Invalid file name path sequence: " + fileName);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
