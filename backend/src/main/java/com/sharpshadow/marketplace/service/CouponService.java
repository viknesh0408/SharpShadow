package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.Coupon;
import com.sharpshadow.marketplace.entity.DiscountType;
import com.sharpshadow.marketplace.entity.Product;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ConflictException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.repository.CouponRepository;
import com.sharpshadow.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public ApplyCouponResponse validateAndApplyCoupon(String couponCode, List<Long> productIds) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            throw new BadRequestException("Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code: " + couponCode));

        if (!"ACTIVE".equalsIgnoreCase(coupon.getStatus())) {
            throw new BadRequestException("Coupon is no longer active");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        // Calculate original total from database prices (never from client)
        List<Product> products = productRepository.findAllById(productIds);
        if (products.isEmpty()) {
            throw new BadRequestException("No valid products found to apply coupon");
        }

        BigDecimal originalTotal = products.stream()
                .map(p -> p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (coupon.getMinimumAmount() != null && originalTotal.compareTo(coupon.getMinimumAmount()) < 0) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinimumAmount() + " required to use this coupon");
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = originalTotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        // Discount cannot exceed original total
        if (discountAmount.compareTo(originalTotal) > 0) {
            discountAmount = originalTotal;
        }

        BigDecimal finalTotal = originalTotal.subtract(discountAmount);

        return ApplyCouponResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .message("Coupon applied successfully!")
                .originalTotal(originalTotal)
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .build();
    }

    @Transactional
    public void incrementUsage(String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) return;
        couponRepository.findByCodeIgnoreCase(couponCode.trim()).ifPresent(c -> {
            c.setTimesUsed(c.getTimesUsed() + 1);
            couponRepository.save(c);
        });
    }

    @Transactional(readOnly = true)
    public PageResponse<CouponResponse> getAllCoupons(Pageable pageable) {
        Page<Coupon> page = couponRepository.findAllByOrderByIdDesc(pageable);
        return PageResponse.of(page.map(mapper::toCouponResponse));
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("Coupon with code '" + code + "' already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumAmount(request.getMinimumAmount())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .timesUsed(0)
                .build();

        return mapper.toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        String code = request.getCode().trim().toUpperCase();
        if (!coupon.getCode().equalsIgnoreCase(code) && couponRepository.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("Coupon with code '" + code + "' already exists");
        }

        coupon.setCode(code);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumAmount(request.getMinimumAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus().toUpperCase());
        }

        return mapper.toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        couponRepository.delete(coupon);
    }
}
