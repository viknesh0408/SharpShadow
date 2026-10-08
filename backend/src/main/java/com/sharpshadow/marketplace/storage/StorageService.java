package com.sharpshadow.marketplace.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Uploads a private asset (PSD, ZIP) using UUID-based secure path.
     */
    FileMetadata uploadPrivate(MultipartFile file);

    /**
     * Uploads a public preview/thumbnail asset.
     */
    FileMetadata uploadPublic(MultipartFile file);

    /**
     * Uploads a public demo PDF file. Only PDF files are allowed.
     */
    FileMetadata uploadDemo(MultipartFile file);

    /**
     * Deletes a stored file by its key/URL.
     */
    void delete(String fileUrl);

    /**
     * Generates a temporary signed download URL for an authorized purchase tied to a user.
     */
    String generateDownloadUrl(String fileUrl, String originalFileName, Long userId, long expiryMinutes);

    /**
     * Validates a signed download token and loads the underlying resource.
     */
    Resource loadAsResource(String relativePath);

    /**
     * Formats bytes into human-readable representation (e.g. 45.2 MB)
     */
    String formatFileSize(long bytes);

    /**
     * Verifies HMAC signature for local storage proxied downloads.
     */
    default boolean verifySignature(String relativePath, Long userId, long expiresAtEpoch, String signature) {
        return false;
    }
}
