package com.sharpshadow.marketplace.storage;

import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Cloudflare R2 (and S3-compatible) Storage Service implementation.
 * Provides high-speed global CDN delivery for public previews and
 * presigned time-limited secure downloads for private assets (PSD, ZIP, PNG).
 */
@Service
@ConditionalOnExpression("'${sharpshadow.storage.type:local}'.equalsIgnoreCase('r2') or '${sharpshadow.storage.type:local}'.equalsIgnoreCase('s3')")
@Slf4j
public class R2StorageService implements StorageService {

    @Value("${sharpshadow.storage.r2.account-id:${R2_ACCOUNT_ID:${STORAGE_ACCOUNT_ID:}}}")
    private String accountId;

    @Value("${sharpshadow.storage.r2.endpoint:${R2_ENDPOINT:${sharpshadow.storage.s3.endpoint:${STORAGE_ENDPOINT:}}}}")
    private String endpoint;

    @Value("${sharpshadow.storage.r2.access-key-id:${R2_ACCESS_KEY_ID:${sharpshadow.storage.s3.access-key:${STORAGE_ACCESS_KEY:}}}}")
    private String accessKey;

    @Value("${sharpshadow.storage.r2.secret-access-key:${R2_SECRET_ACCESS_KEY:${sharpshadow.storage.s3.secret-key:${STORAGE_SECRET_KEY:}}}}")
    private String secretKey;

    @Value("${sharpshadow.storage.r2.bucket:${R2_BUCKET_NAME:${sharpshadow.storage.s3.bucket:${STORAGE_BUCKET:sharpshadow-assets}}}}")
    private String bucket;

    @Value("${sharpshadow.storage.r2.public-url:${R2_PUBLIC_URL:${STORAGE_PUBLIC_URL:}}}")
    private String publicUrl;

    @Value("${sharpshadow.storage.r2.region:${R2_REGION:${sharpshadow.storage.s3.region:${STORAGE_REGION:auto}}}}")
    private String region;

    private S3Client s3Client;
    private S3Presigner s3Presigner;
    private String effectiveEndpoint;

    @PostConstruct
    public void init() {
        if (!StringUtils.hasText(endpoint) && StringUtils.hasText(accountId)) {
            this.effectiveEndpoint = "https://" + accountId.trim() + ".r2.cloudflarestorage.com";
        } else if (StringUtils.hasText(endpoint)) {
            this.effectiveEndpoint = endpoint.trim();
        } else {
            this.effectiveEndpoint = "https://s3.amazonaws.com";
        }

        if (!StringUtils.hasText(accessKey) || !StringUtils.hasText(secretKey)) {
            log.warn("Cloudflare R2 credentials (access-key / secret-key) are not configured! Operations requiring storage will fail.");
        }

        String effectiveRegion = (StringUtils.hasText(region)) ? region.trim() : "auto";

        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                StringUtils.hasText(accessKey) ? accessKey.trim() : "dummy",
                StringUtils.hasText(secretKey) ? secretKey.trim() : "dummy"
        );
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(credentials);

        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(this.effectiveEndpoint))
                .credentialsProvider(credentialsProvider)
                .region(Region.of(effectiveRegion))
                .serviceConfiguration(s3Configuration)
                .build();

        this.s3Presigner = S3Presigner.builder()
                .endpointOverride(URI.create(this.effectiveEndpoint))
                .credentialsProvider(credentialsProvider)
                .region(Region.of(effectiveRegion))
                .serviceConfiguration(s3Configuration)
                .build();

        log.info("Cloudflare R2 / S3 storage initialized. Endpoint: {}, Bucket: {}, Public CDN URL: {}",
                this.effectiveEndpoint, this.bucket, StringUtils.hasText(publicUrl) ? publicUrl : "(Direct S3/R2 path)");
    }

    @Override
    public FileMetadata uploadPrivate(MultipartFile file) {
        validatePrivateFile(file);
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset.psd");
            String extension = getFileExtension(originalFilename);
            String uuid = UUID.randomUUID().toString();
            String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
            String key = "private/" + uuid + "/" + storedFileName;

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return FileMetadata.builder()
                    .originalFileName(originalFilename)
                    .storedFileName(storedFileName)
                    .fileUrl(key)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .formattedSize(formatFileSize(file.getSize()))
                    .build();
        } catch (IOException ex) {
            log.error("Failed to upload private file to Cloudflare R2", ex);
            throw new BadRequestException("Could not upload file to Cloudflare R2: " + ex.getMessage());
        }
    }

    @Override
    public FileMetadata uploadPublic(MultipartFile file) {
        validatePublicFile(file);
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "preview.jpg");
            String extension = getFileExtension(originalFilename);
            String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
            String key = "uploads/" + storedFileName;

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String finalPublicUrl;
            if (StringUtils.hasText(publicUrl)) {
                String base = publicUrl.trim();
                if (base.endsWith("/")) {
                    base = base.substring(0, base.length() - 1);
                }
                finalPublicUrl = base + "/" + key;
            } else {
                finalPublicUrl = effectiveEndpoint + "/" + bucket + "/" + key;
            }

            return FileMetadata.builder()
                    .originalFileName(originalFilename)
                    .storedFileName(storedFileName)
                    .fileUrl(finalPublicUrl)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .formattedSize(formatFileSize(file.getSize()))
                    .build();
        } catch (IOException ex) {
            log.error("Failed to upload public file to Cloudflare R2", ex);
            throw new BadRequestException("Could not upload public file to Cloudflare R2: " + ex.getMessage());
        }
    }

    @Override
    public FileMetadata uploadDemo(MultipartFile file) {
        validateDemoPdfFile(file);
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "demo.pdf");
            String storedFileName = "demo-" + UUID.randomUUID() + ".pdf";
            String key = "uploads/" + storedFileName;

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType("application/pdf")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String finalPublicUrl;
            if (StringUtils.hasText(publicUrl)) {
                String base = publicUrl.trim();
                if (base.endsWith("/")) {
                    base = base.substring(0, base.length() - 1);
                }
                finalPublicUrl = base + "/" + key;
            } else {
                finalPublicUrl = effectiveEndpoint + "/" + bucket + "/" + key;
            }

            return FileMetadata.builder()
                    .originalFileName(originalFilename)
                    .storedFileName(storedFileName)
                    .fileUrl(finalPublicUrl)
                    .contentType("application/pdf")
                    .size(file.getSize())
                    .formattedSize(formatFileSize(file.getSize()))
                    .build();
        } catch (IOException ex) {
            log.error("Failed to upload demo PDF to Cloudflare R2", ex);
            throw new BadRequestException("Could not upload demo PDF to Cloudflare R2: " + ex.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) return;
        try {
            String key = extractKeyFromFileUrl(fileUrl);
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteRequest);
        } catch (Exception ex) {
            log.warn("Failed to delete object from Cloudflare R2: {}", fileUrl, ex);
        }
    }

    @Override
    public String generateDownloadUrl(String fileUrl, String originalFileName, Long userId, long expiryMinutes) {
        if (!StringUtils.hasText(fileUrl)) {
            throw new BadRequestException("Asset file URL is missing");
        }
        String key = extractKeyFromFileUrl(fileUrl);
        String safeFileName = (StringUtils.hasText(originalFileName)) ? originalFileName : "download.psd";

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .responseContentDisposition("attachment; filename=\"" + safeFileName + "\"")
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(Math.max(1, expiryMinutes)))
                    .getObjectRequest(getRequest)
                    .build();

            PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
            return presigned.url().toString();
        } catch (Exception ex) {
            log.error("Failed to generate presigned download URL for key: {}", key, ex);
            throw new BadRequestException("Failed to generate presigned download URL: " + ex.getMessage());
        }
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        String key = extractKeyFromFileUrl(relativePath);
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(getRequest);
            return new InputStreamResource(s3Stream);
        } catch (NoSuchKeyException ex) {
            throw new ResourceNotFoundException("File not found on Cloudflare R2: " + key);
        } catch (Exception ex) {
            log.error("Error loading resource from Cloudflare R2: {}", key, ex);
            throw new ResourceNotFoundException("Error loading resource from Cloudflare R2");
        }
    }

    @Override
    public boolean verifySignature(String relativePath, Long userId, long expiresAtEpoch, String signature) {
        // Direct R2 presigned URLs are verified by AWS SigV4 natively at Cloudflare edge.
        return true;
    }

    @Override
    public String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }

    private String extractKeyFromFileUrl(String fileUrl) {
        if (fileUrl == null) return "";
        String clean = fileUrl.trim();
        if (clean.startsWith("/")) {
            clean = clean.substring(1);
        }
        if (StringUtils.hasText(publicUrl) && clean.startsWith(publicUrl)) {
            clean = clean.substring(publicUrl.length());
            if (clean.startsWith("/")) {
                clean = clean.substring(1);
            }
        }
        return clean;
    }

    private void validatePublicFile(MultipartFile file) {
        validateBasic(file);
        String ext = getFileExtension(file.getOriginalFilename()).toLowerCase();
        Set<String> allowedExts = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");
        if (!allowedExts.contains(ext)) {
            throw new BadRequestException("Only image uploads (JPEG, PNG, WEBP, GIF, SVG) are allowed for public files.");
        }

        try (java.io.InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
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
        Set<String> blockedExts = Set.of(
                "exe", "bat", "cmd", "sh", "php", "phtml", "jsp", "asp", "aspx", "html", "htm", "js", "jar", "war", "py"
        );
        if (blockedExts.contains(ext)) {
            throw new BadRequestException("Executable or script file type is not permitted.");
        }
    }

    private void validateDemoPdfFile(MultipartFile file) {
        validateBasic(file);
        String ext = getFileExtension(file.getOriginalFilename()).toLowerCase();
        if (!"pdf".equals(ext)) {
            throw new BadRequestException("Only PDF (.pdf) files are allowed for demo attachments.");
        }
        try (java.io.InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            int read = is.read(header);
            if (read < 4 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                throw new BadRequestException("Invalid or corrupted PDF file signature. File must be a valid PDF document.");
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not read demo file contents for validation.");
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
