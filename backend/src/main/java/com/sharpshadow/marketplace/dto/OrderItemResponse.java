package com.sharpshadow.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productSlug;
    private String productThumbnail;
    private BigDecimal price;
}
