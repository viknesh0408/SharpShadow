package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.ApiResponse;
import com.sharpshadow.marketplace.dto.ApplyCouponRequest;
import com.sharpshadow.marketplace.dto.ApplyCouponResponse;
import com.sharpshadow.marketplace.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ApplyCouponResponse>> validateCoupon(
            @Valid @RequestBody ApplyCouponRequest request
    ) {
        ApplyCouponResponse response = couponService.validateAndApplyCoupon(request.getCouponCode(), request.getProductIds());
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
