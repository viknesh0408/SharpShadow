package com.sharpshadow.marketplace.dto;

import com.sharpshadow.marketplace.entity.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal totalAmount;
    private String currency;
    private OrderStatus status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpayKeyId; // Public key for frontend checkout
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
