package com.sharpshadow.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRPaymentResponse {
    private String orderNumber;
    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String qrCodePayload; // UPI URI or dynamic payment string e.g. upi://pay?pa=...
    private String status; // CREATED, PENDING, PAID
}
