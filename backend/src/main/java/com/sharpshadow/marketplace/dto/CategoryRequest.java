package com.sharpshadow.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private String status; // ACTIVE, INACTIVE
}
