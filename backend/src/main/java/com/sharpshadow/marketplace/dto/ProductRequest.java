package com.sharpshadow.marketplace.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    private String slug;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount price must be non-negative")
    private BigDecimal discountPrice;

    private String thumbnailUrl;
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private String demoFileUrl;
    private String demoFileName;
    private String dimensions;
    private String resolution;
    private String colorMode;
    private String photoshopVersion;

    private Boolean featured;
    private String status; // PUBLISHED, DRAFT, ARCHIVED

    private List<String> previewImages;
}
