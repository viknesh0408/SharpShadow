package com.sharpshadow.marketplace.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadResponse {
    private Long productId;
    private String productTitle;
    private String fileName;
    private String fileSize;
    private String downloadUrl; // Temporary signed download URL
    private LocalDateTime expiresAt;
    private String message;
}
