package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    Optional<Payment> findByOrderId(Long orderId);
    boolean existsByRazorpayPaymentId(String razorpayPaymentId);
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
