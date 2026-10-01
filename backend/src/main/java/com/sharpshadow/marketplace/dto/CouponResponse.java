package com.sharpshadow.marketplace.dto;

import com.sharpshadow.marketplace.entity.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumAmount;
    private LocalDateTime expiryDate;
    private Integer usageLimit;
    private Integer timesUsed;
    private String status;
}
