package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.ApiResponse;
import com.sharpshadow.marketplace.dto.PaymentResponse;
import com.sharpshadow.marketplace.dto.PaymentVerificationRequest;
import com.sharpshadow.marketplace.dto.QRPaymentResponse;
import com.sharpshadow.marketplace.service.OrderService;
import com.sharpshadow.marketplace.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharpshadow.marketplace.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to verify payment", "/api/payments/verify"));
        }
        PaymentResponse response = paymentService.verifyAndCapturePayment(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment verified and order confirmed"));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature
    ) {
        log.info("Incoming Razorpay webhook request received");
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/qr/{orderNumber}")
    public ResponseEntity<ApiResponse<QRPaymentResponse>> getQrPayment(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required", "/api/payments/qr"));
        }
        QRPaymentResponse response = paymentService.getQrPaymentInfo(orderNumber, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{orderNumber}")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkPaymentStatus(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required", "/api/payments/status"));
        }
        boolean isAdmin = principal.getAuthorities() != null &&
                principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        var order = orderService.getOrderByOrderNumber(orderNumber, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "orderNumber", order.getOrderNumber(),
                "status", order.getStatus().name()
        )));
    }
}
