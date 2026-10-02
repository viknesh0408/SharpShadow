package com.sharpshadow.marketplace.storage;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {
    private String originalFileName;
    private String storedFileName;
    private String fileUrl;
    private String contentType;
    private long size;
    private String formattedSize;
}
