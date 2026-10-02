package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.PaymentResponse;
import com.sharpshadow.marketplace.dto.PaymentVerificationRequest;
import com.sharpshadow.marketplace.dto.QRPaymentResponse;
import com.sharpshadow.marketplace.entity.Order;
import com.sharpshadow.marketplace.entity.OrderStatus;
import com.sharpshadow.marketplace.entity.Payment;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.PaymentVerificationException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.payment.RazorpayService;
import com.sharpshadow.marketplace.repository.OrderRepository;
import com.sharpshadow.marketplace.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final CouponService couponService;
    private final EntityDtoMapper mapper;

    @Transactional
    public PaymentResponse verifyAndCapturePayment(PaymentVerificationRequest request, Long currentUserId) {
        log.info("Verifying Razorpay payment for Order ID: {}, Payment ID: {}, by User: {}",
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), currentUserId);

        // 1. Signature verification (Server side cryptographic HMAC-SHA256)
        boolean isValid = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            log.error("Signature verification failed for order: {}", request.getRazorpayOrderId());
            throw new PaymentVerificationException("Payment signature verification failed. Untrusted payment.");
        }

        // 2. Retrieve Order
        Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("No order found for Razorpay Order ID: " + request.getRazorpayOrderId()));

        // 3. Enforce Order Ownership
        if (!order.getUserId().equals(currentUserId)) {
            log.error("Security alert: User {} attempted to verify payment for order {} belonging to user {}",
                    currentUserId, order.getOrderNumber(), order.getUserId());
            throw new PaymentVerificationException("Unauthorized: You do not own this order.");
        }

        // 4. Verify payment status and amount with Razorpay Gateway directly
        boolean gatewayVerified = razorpayService.verifyPaymentWithGateway(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                order.getTotalAmount()
        );
        if (!gatewayVerified) {
            log.error("Gateway status verification failed for order: {}", request.getRazorpayOrderId());
            throw new PaymentVerificationException("Payment verification with payment gateway failed. Transaction unconfirmed.");
        }

        // 5. Idempotency: If already paid, return existing payment record without duplicate processing
        if (order.getStatus() == OrderStatus.PAID) {
            log.info("Order {} is already marked PAID. Returning existing payment.", order.getOrderNumber());
            Payment existingPayment = paymentRepository.findByOrderId(order.getId()).orElse(null);
            if (existingPayment != null) {
                return mapper.toPaymentResponse(existingPayment, order.getOrderNumber());
            }
        }

        // 6. Mark order as PAID
        order.setStatus(OrderStatus.PAID);
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        orderRepository.save(order);

        // 7. Record Payment
        Payment payment = Payment.builder()
                .orderId(order.getId())
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .amount(order.getTotalAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "razorpay")
                .status("captured")
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment captured successfully for order: {}", order.getOrderNumber());

        // 8. Increment coupon usage if coupon was applied
        if (order.getCouponCode() != null) {
            couponService.incrementCouponUsage(order.getCouponCode());
        }

        return mapper.toPaymentResponse(savedPayment, order.getOrderNumber());
    }

    @Transactional
    public void processWebhook(String payload, String signatureHeader) {
        log.info("Received Razorpay Webhook notification");

        boolean isValid = razorpayService.verifyWebhookSignature(payload, signatureHeader);
        if (!isValid) {
            log.error("Webhook signature mismatch or missing secret! Rejecting untrusted webhook payload.");
            throw new PaymentVerificationException("Invalid webhook signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event");
        log.info("Processing webhook event: {}", eventType);

        if ("order.paid".equalsIgnoreCase(eventType) || "payment.captured".equalsIgnoreCase(eventType)) {
            JSONObject payloadObj = event.optJSONObject("payload");
            if (payloadObj != null) {
                JSONObject paymentObj = payloadObj.optJSONObject("payment");
                JSONObject orderObj = payloadObj.optJSONObject("order");

                String razorpayOrderId = null;
                String razorpayPaymentId = null;
                BigDecimal amount = BigDecimal.ZERO;
                String method = "webhook";

                if (orderObj != null && orderObj.has("entity")) {
                    JSONObject orderEntity = orderObj.getJSONObject("entity");
                    razorpayOrderId = orderEntity.optString("id");
                }
                if (paymentObj != null && paymentObj.has("entity")) {
                    JSONObject payEntity = paymentObj.getJSONObject("entity");
                    razorpayPaymentId = payEntity.optString("id");
                    if (razorpayOrderId == null) {
                        razorpayOrderId = payEntity.optString("order_id");
                    }
                    method = payEntity.optString("method", "razorpay");
                    long amountPaise = payEntity.optLong("amount", 0L);
                    amount = BigDecimal.valueOf(amountPaise).divide(BigDecimal.valueOf(100));
                }

                if (razorpayOrderId != null) {
                    Optional<Order> orderOpt = orderRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (orderOpt.isPresent()) {
                        Order order = orderOpt.get();

                        // Enforce amount validation: paid amount must match or exceed order total
                        if (amount.compareTo(BigDecimal.ZERO) > 0 && amount.compareTo(order.getTotalAmount()) < 0) {
                            log.error("Security alert: Webhook paid amount {} is less than order total {} for order {}",
                                    amount, order.getTotalAmount(), order.getOrderNumber());
                            return;
                        }

                        if (order.getStatus() != OrderStatus.PAID) {
                            order.setStatus(OrderStatus.PAID);
                            if (razorpayPaymentId != null) {
                                order.setRazorpayPaymentId(razorpayPaymentId);
                            }
                            orderRepository.save(order);

                            if (razorpayPaymentId != null && !paymentRepository.existsByRazorpayPaymentId(razorpayPaymentId)) {
                                Payment payment = Payment.builder()
                                        .orderId(order.getId())
                                        .razorpayOrderId(razorpayOrderId)
                                        .razorpayPaymentId(razorpayPaymentId)
                                        .amount(amount.compareTo(BigDecimal.ZERO) > 0 ? amount : order.getTotalAmount())
                                        .paymentMethod(method)
                                        .status("captured")
                                        .build();
                                paymentRepository.save(payment);
                            }

                            if (order.getCouponCode() != null) {
                                couponService.incrementCouponUsage(order.getCouponCode());
                            }

                            log.info("Webhook successfully marked order {} as PAID", order.getOrderNumber());
                        }
                    }
                }
            }
        } else if ("payment.failed".equalsIgnoreCase(eventType)) {
            JSONObject payloadObj = event.optJSONObject("payload");
            if (payloadObj != null && payloadObj.has("payment")) {
                JSONObject payEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                String razorpayOrderId = payEntity.optString("order_id");
                if (razorpayOrderId != null) {
                    orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
                        if (order.getStatus() == OrderStatus.CREATED || order.getStatus() == OrderStatus.PENDING) {
                            order.setStatus(OrderStatus.FAILED);
                            orderRepository.save(order);
                        }
                    });
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public QRPaymentResponse getQrPaymentInfo(String orderNumber, Long currentUserId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        if (!order.getUserId().equals(currentUserId)) {
            throw new PaymentVerificationException("Unauthorized: You do not own this order.");
        }

        return QRPaymentResponse.builder()
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(order.getRazorpayOrderId())
                .amount(order.getTotalAmount())
                .currency(order.getCurrency())
                .qrCodePayload("")
                .status(order.getStatus().name())
                .build();
    }
}
