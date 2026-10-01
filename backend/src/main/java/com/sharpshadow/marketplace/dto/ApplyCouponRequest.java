package com.sharpshadow.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String couponCode;

    @NotEmpty(message = "Products are required to compute coupon discount")
    private List<Long> productIds;
}
