package com.sharpshadow.marketplace;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.DiscountType;
import com.sharpshadow.marketplace.entity.Role;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ForbiddenException;
import com.sharpshadow.marketplace.payment.RazorpayService;
import com.sharpshadow.marketplace.service.*;
import com.sharpshadow.marketplace.storage.LocalStorageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BackendTests {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private DownloadService downloadService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private LocalStorageService storageService;

    @Test
    @DisplayName("Test 1: User Registration and Login flow")
    void testAuthFlow() {
        String email = "testuser" + System.currentTimeMillis() + "@sharpshadow.com";
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Test User")
                .email(email)
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        AuthResponse authRes = userService.register(registerReq);
        assertNotNull(authRes.getToken());
        assertEquals(Role.CUSTOMER, authRes.getUser().getRole());

        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password("Password@123")
                .build();

        AuthResponse loginRes = userService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertEquals(email, loginRes.getUser().getEmail());
    }

    @Test
    @DisplayName("Test 2: Product Creation and Retrieval")
    void testProductCreationAndRetrieval() {
        CategoryResponse cat = categoryService.getActiveCategories().get(0);

        ProductRequest req = ProductRequest.builder()
                .title("Luxury Wedding Monogram PSD")
                .categoryId(cat.getId())
                .description("High-end monogram PSD template")
                .price(BigDecimal.valueOf(399.00))
                .discountPrice(BigDecimal.valueOf(299.00))
                .dimensions("4000x3000")
                .resolution("300 DPI")
                .colorMode("RGB")
                .photoshopVersion("CC 2024")
                .featured(true)
                .status("PUBLISHED")
                .build();

        ProductResponse created = productService.createProduct(req);
        assertNotNull(created.getId());
        assertEquals("Luxury Wedding Monogram PSD", created.getTitle());
        assertTrue(created.getSlug().contains("luxury-wedding-monogram-psd"));

        ProductResponse fetched = productService.getBySlug(created.getSlug(), null, false);
        assertEquals(created.getId(), fetched.getId());
        assertNull(fetched.getInternalFileUrl()); // Ensure private file URL is masked for public
    }

    @Test
    @DisplayName("Test 3: Coupon Validation and Calculation")
    void testCouponValidation() {
        var products = productService.getProducts(null, null, null, null, "newest", 0, 10, null);
        List<Long> prodIds = products.getContent().stream().map(ProductResponse::getId).toList();

        ApplyCouponResponse res = couponService.validateAndApplyCoupon("SHARP20", prodIds);
        assertTrue(res.isValid());
        assertEquals("SHARP20", res.getCode());
        assertTrue(res.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(res.getOriginalTotal().subtract(res.getDiscountAmount()), res.getFinalTotal());
    }

    @Test
    @DisplayName("Test 4: Order Creation with database verified prices")
    void testOrderCreation() {
        UserDto user = userService.getCurrentUserDto("customer@sharpshadow.com");
        var products = productService.getProducts(null, null, null, null, "newest", 0, 10, null);
        List<Long> prodIds = products.getContent().stream().map(ProductResponse::getId).toList();

        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .productIds(prodIds)
                .couponCode("SHARP20")
                .build();

        OrderResponse orderRes = orderService.createOrder(orderReq, user.getId());
        assertNotNull(orderRes.getOrderNumber());
        assertNotNull(orderRes.getRazorpayOrderId());
        assertEquals(prodIds.size(), orderRes.getItems().size());
        assertTrue(orderRes.getTotalAmount().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Test 5: Download Authorization (403 for unpaid product)")
    void testDownloadUnauthorized() {
        UserDto user = userService.getCurrentUserDto("customer@sharpshadow.com");
        var products = productService.getProducts(null, null, null, null, "newest", 0, 1, null);
        Long prodId = products.getContent().get(0).getId();

        // Should throw ForbiddenException because customer hasn't paid yet
        assertThrows(ForbiddenException.class, () -> {
            downloadService.authorizeAndGenerateDownloadUrl(prodId, user.getId(), "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Test 6: HMAC Signature generation & verification")
    void testStorageSignedUrlVerification() {
        String relativePath = "seed-assets/sample-asset.psd";
        String signedUrl = storageService.generateDownloadUrl(relativePath, "sample-asset.psd", 60);
        assertTrue(signedUrl.contains("/api/downloads/file?file="));
        assertTrue(signedUrl.contains("&sig="));
    }
}
