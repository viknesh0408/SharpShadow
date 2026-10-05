package com.sharpshadow.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private CategoryResponse category;
    private String thumbnailUrl;
    private String fileName;
    private String fileSize;
    private String dimensions;
    private String resolution;
    private String colorMode;
    private String photoshopVersion;
    private Boolean featured;
    private String status;
    private Long downloadCount;
    private List<String> previewImages;
    private Boolean hasPurchased;
    private Boolean free;
    private Boolean isPng;
    private String fileFormat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // For admin view only
    private String internalFileUrl;
}
