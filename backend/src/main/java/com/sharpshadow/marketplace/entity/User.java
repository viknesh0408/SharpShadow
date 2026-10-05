package com.sharpshadow.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Builder.Default
    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified = false;

    @Column(name = "verification_otp", length = 10)
    private String verificationOtp;

    @Column(name = "verification_otp_expiry")
    private LocalDateTime verificationOtpExpiry;

    @Column(name = "reset_password_token", length = 100)
    private String resetPasswordToken;

    @Column(name = "reset_password_expiry")
    private LocalDateTime resetPasswordExpiry;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
