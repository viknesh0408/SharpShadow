package com.sharpshadow.marketplace.payment;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.PaymentVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;
import java.util.UUID;

@Service
@Slf4j
public class RazorpayService {

    @Value("${sharpshadow.razorpay.key-id}")
    private String keyId;

    @Value("${sharpshadow.razorpay.key-secret}")
    private String keySecret;

    @Value("${sharpshadow.razorpay.webhook-secret}")
    private String webhookSecret;

    @Value("${sharpshadow.razorpay.currency:INR}")
    private String currency;

    public String getKeyId() {
        return keyId;
    }

    /**
     * Creates an official Razorpay Order.
     * Amount is passed in normal currency (e.g. 499.00) and converted to paise (49900).
     */
    public String createRazorpayOrder(String internalOrderNumber, BigDecimal amount) {
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
        if (amountInPaise <= 0) {
            throw new BadRequestException("Order amount must be greater than zero");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", internalOrderNumber);

            JSONObject notes = new JSONObject();
            notes.put("internalOrderNumber", internalOrderNumber);
            notes.put("platform", "SharpShadow");
            orderRequest.put("notes", notes);

            com.razorpay.Order order = razorpay.orders.create(orderRequest);
            return order.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for receipt {}: {}", internalOrderNumber, e.getMessage());
            throw new BadRequestException("Payment gateway order creation failed: " + e.getMessage());
        }
    }

    /**
     * Verifies Razorpay payment signature strictly using HMAC-SHA256: HMAC_SHA256(order_id + "|" + payment_id, secret)
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            throw new PaymentVerificationException("Missing signature verification parameters");
        }

        if (keySecret == null || keySecret.trim().isEmpty()) {
            throw new PaymentVerificationException("Razorpay key secret is not configured on server");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret.trim());
            if (isValid) {
                return true;
            }
        } catch (Exception e) {
            log.warn("Standard Razorpay signature validation check error: {}", e.getMessage());
        }

        // Direct HMAC-SHA256 calculation fallback
        String generatedSignature = calculateHmacSha256(razorpayOrderId + "|" + razorpayPaymentId, keySecret.trim());
        return generatedSignature.equalsIgnoreCase(razorpaySignature.trim());
    }

    /**
     * Confirms the payment status and amount with Razorpay REST API directly.
     */
    public boolean verifyPaymentWithGateway(String razorpayOrderId, String razorpayPaymentId, BigDecimal expectedAmount) {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            log.warn("Razorpay credentials not fully configured, relying only on cryptographic signature");
            return true;
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId.trim(), keySecret.trim());
            com.razorpay.Payment payment = razorpay.payments.fetch(razorpayPaymentId);
            if (payment == null) {
                log.error("Payment {} could not be retrieved from Razorpay", razorpayPaymentId);
                return false;
            }

            String fetchedOrderId = payment.get("order_id");
            if (!razorpayOrderId.equals(fetchedOrderId)) {
                log.error("Razorpay payment order mismatch. Expected: {}, Got: {}", razorpayOrderId, fetchedOrderId);
                return false;
            }

            String status = payment.get("status");
            if (!"captured".equalsIgnoreCase(status) && !"authorized".equalsIgnoreCase(status)) {
                log.error("Razorpay payment status is invalid: {}", status);
                return false;
            }

            long amountInPaise = ((Number) payment.get("amount")).longValue();
            long expectedPaise = expectedAmount.multiply(BigDecimal.valueOf(100)).longValue();
            if (amountInPaise < expectedPaise) {
                log.error("Razorpay payment amount mismatch: expected at least {} paise, but got {} paise", expectedPaise, amountInPaise);
                return false;
            }

            return true;
        } catch (RazorpayException e) {
            log.error("Failed to fetch payment details from Razorpay: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifies Webhook signature strictly against X-Razorpay-Signature header.
     */
    public boolean verifyWebhookSignature(String requestBody, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank() || requestBody == null || requestBody.isBlank()) {
            return false;
        }
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("RAZORPAY_WEBHOOK_SECRET is not configured on server! Rejecting webhook.");
            return false;
        }
        try {
            return Utils.verifyWebhookSignature(requestBody, signatureHeader.trim(), webhookSecret.trim());
        } catch (Exception e) {
            String calculated = calculateHmacSha256(requestBody, webhookSecret.trim());
            return calculated.equalsIgnoreCase(signatureHeader.trim());
        }
    }

    private String calculateHmacSha256(String data, String secret) {
        try {
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return toHexString(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256", e);
        }
    }

    private String toHexString(byte[] bytes) {
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }
}
