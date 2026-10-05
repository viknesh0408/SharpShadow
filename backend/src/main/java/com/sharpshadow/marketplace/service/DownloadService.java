package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.DownloadResponse;
import com.sharpshadow.marketplace.dto.PageResponse;
import com.sharpshadow.marketplace.entity.*;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ForbiddenException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.repository.*;
import com.sharpshadow.marketplace.storage.LocalStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DownloadService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final DownloadRepository downloadRepository;
    private final UserRepository userRepository;
    private final LocalStorageService storageService;

    @Value("${sharpshadow.storage.url-expiry-minutes:60}")
    private long expiryMinutes;

    @Transactional
    public DownloadResponse authorizeAndGenerateDownloadUrl(Long productId, Long userId, String ipAddress) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!"PUBLISHED".equalsIgnoreCase(product.getStatus())) {
            throw new BadRequestException("Product is not available for download");
        }

        boolean isFree = product.isFree();

        // Check if user has a PAID order containing this product
        Order order = orderRepository.findFirstPaidOrderForUserAndProduct(userId, productId).orElse(null);

        if (order == null) {
            if (isFree) {
                // Auto-create a free completed order for this user and product!
                String orderNumber = "FREE-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now()) + "-" +
                        UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                String freeRef = "FREE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                order = Order.builder()
                        .orderNumber(orderNumber)
                        .userId(userId)
                        .totalAmount(BigDecimal.ZERO)
                        .discountAmount(BigDecimal.ZERO)
                        .currency("INR")
                        .status(OrderStatus.PAID)
                        .razorpayOrderId(freeRef)
                        .razorpayPaymentId("PAY-" + freeRef)
                        .build();
                order = orderRepository.save(order);

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .price(BigDecimal.ZERO)
                        .build();
                orderItemRepository.save(item);

                Payment payment = Payment.builder()
                        .orderId(order.getId())
                        .razorpayOrderId(freeRef)
                        .razorpayPaymentId("PAY-" + freeRef)
                        .amount(BigDecimal.ZERO)
                        .paymentMethod("FREE_DOWNLOAD")
                        .status("captured")
                        .build();
                paymentRepository.save(payment);
            } else {
                throw new ForbiddenException("Access denied: You have not purchased this product");
            }
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new ForbiddenException("Access denied: Order is not paid");
        }

        if (product.getFileUrl() == null || product.getFileUrl().trim().isEmpty()) {
            throw new BadRequestException("Digital asset file is currently being prepared for this item");
        }

        // Track download
        Download download = Download.builder()
                .userId(userId)
                .productId(productId)
                .orderId(order.getId())
                .ipAddress(ipAddress)
                .build();
        downloadRepository.save(download);

        // Increment product downloadCount
        product.setDownloadCount(product.getDownloadCount() + 1);
        productRepository.save(product);

        // Generate temporary HMAC-signed download URL tied to user
        String signedUrl = storageService.generateDownloadUrl(product.getFileUrl(), product.getFileName(), userId, expiryMinutes);

        return DownloadResponse.builder()
                .productId(product.getId())
                .productTitle(product.getTitle())
                .fileName(product.getFileName())
                .fileSize(product.getFileSize())
                .downloadUrl(signedUrl)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .message("Download access authorized. Token valid for " + expiryMinutes + " minutes.")
                .build();
    }

    public Resource serveSecureFile(String fileRelativePath, Long userId, long expiresAtEpoch, String signature) {
        boolean valid = storageService.verifySignature(fileRelativePath, userId, expiresAtEpoch, signature);
        if (!valid) {
            throw new ForbiddenException("Download link has expired or has an invalid signature. Please generate a new download link.");
        }
        return storageService.loadAsResource(fileRelativePath);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getUserDownloads(Long userId, Pageable pageable) {
        Page<Download> downloads = downloadRepository.findByUserIdOrderByDownloadedAtDesc(userId, pageable);
        Map<Long, Product> productCache = new HashMap<>();

        return PageResponse.of(downloads.map(dl -> {
            Product prod = productCache.computeIfAbsent(dl.getProductId(), id -> productRepository.findById(id).orElse(null));
            Map<String, Object> map = new HashMap<>();
            map.put("id", dl.getId());
            map.put("productId", dl.getProductId());
            map.put("productTitle", prod != null ? prod.getTitle() : "Unknown Asset");
            map.put("productSlug", prod != null ? prod.getSlug() : "");
            map.put("thumbnailUrl", prod != null ? prod.getThumbnailUrl() : "");
            map.put("fileName", prod != null ? prod.getFileName() : "");
            map.put("fileSize", prod != null ? prod.getFileSize() : "");
            map.put("orderId", dl.getOrderId());
            map.put("downloadedAt", dl.getDownloadedAt());
            return map;
        }));
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getAdminDownloads(Pageable pageable) {
        Page<Download> downloads = downloadRepository.findAllByOrderByDownloadedAtDesc(pageable);
        Map<Long, Product> productCache = new HashMap<>();
        Map<Long, User> userCache = new HashMap<>();

        return PageResponse.of(downloads.map(dl -> {
            Product prod = productCache.computeIfAbsent(dl.getProductId(), id -> productRepository.findById(id).orElse(null));
            User user = userCache.computeIfAbsent(dl.getUserId(), id -> userRepository.findById(id).orElse(null));
            Map<String, Object> map = new HashMap<>();
            map.put("id", dl.getId());
            map.put("productId", dl.getProductId());
            map.put("productTitle", prod != null ? prod.getTitle() : "Unknown Asset");
            map.put("userId", dl.getUserId());
            map.put("userName", user != null ? user.getName() : "Unknown User");
            map.put("userEmail", user != null ? user.getEmail() : "");
            map.put("ipAddress", dl.getIpAddress());
            map.put("downloadedAt", dl.getDownloadedAt());
            return map;
        }));
    }
}
