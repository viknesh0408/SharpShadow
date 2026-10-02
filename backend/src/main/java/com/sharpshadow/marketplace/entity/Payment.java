package com.sharpshadow.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false, length = 100)
    private String razorpayOrderId;

    @Column(nullable = false, unique = true, length = 100)
    private String razorpayPaymentId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 50)
    private String paymentMethod; // upi, card, netbanking, qr

    @Column(nullable = false, length = 50)
    private String status; // captured, authorized, failed, refunded

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
