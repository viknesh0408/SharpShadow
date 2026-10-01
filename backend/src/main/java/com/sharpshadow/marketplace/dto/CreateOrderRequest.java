package com.sharpshadow.marketplace.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    @NotEmpty(message = "Order must contain at least one product")
    private List<Long> productIds;

    private String couponCode;
}
