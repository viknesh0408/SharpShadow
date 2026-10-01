package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Order;
import com.sharpshadow.marketplace.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i " +
           "WHERE o.userId = :userId AND i.product.id = :productId AND o.status = :status")
    boolean existsByUserIdAndProductIdAndStatus(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("status") OrderStatus status
    );

    @Query("SELECT o FROM Order o JOIN o.items i " +
           "WHERE o.userId = :userId AND i.product.id = :productId AND o.status = 'PAID' " +
           "ORDER BY o.createdAt DESC")
    Optional<Order> findFirstPaidOrderForUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'PAID'")
    BigDecimal sumTotalPaidRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'PAID' AND o.createdAt >= :since")
    BigDecimal sumPaidRevenueSince(@Param("since") LocalDateTime since);

    long countByCreatedAtAfter(LocalDateTime since);
}
