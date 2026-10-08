package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.Role;
import com.sharpshadow.marketplace.service.*;
import com.sharpshadow.marketplace.storage.FileMetadata;
import com.sharpshadow.marketplace.storage.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final CouponService couponService;
    private final DownloadService downloadService;
    private final StorageService storageService;

    // --- Dashboard ---
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        AdminDashboardStats stats = orderService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // --- File Uploads ---
    @PostMapping("/upload/asset")
    public ResponseEntity<ApiResponse<FileMetadata>> uploadPrivateAsset(@RequestParam("file") MultipartFile file) {
        FileMetadata metadata = storageService.uploadPrivate(file);
        return ResponseEntity.ok(ApiResponse.success(metadata, "Asset uploaded securely"));
    }

    @PostMapping("/upload/image")
    public ResponseEntity<ApiResponse<FileMetadata>> uploadPublicImage(@RequestParam("file") MultipartFile file) {
        FileMetadata metadata = storageService.uploadPublic(file);
        return ResponseEntity.ok(ApiResponse.success(metadata, "Image preview uploaded successfully"));
    }

    @PostMapping("/upload/demo")
    public ResponseEntity<ApiResponse<FileMetadata>> uploadDemoPdf(@RequestParam("file") MultipartFile file) {
        FileMetadata metadata = storageService.uploadDemo(file);
        return ResponseEntity.ok(ApiResponse.success(metadata, "Demo PDF attached successfully"));
    }

    // --- Products ---
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<ProductResponse> products = productService.getAdminProducts(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/png")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAdminPngProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<ProductResponse> products = productService.getAdminPngProducts(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getById(id, null, true);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product created successfully"));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product updated successfully"));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getAdminCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<CategoryResponse> categories = categoryService.getAllCategories(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category created successfully"));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }

    // --- Orders ---
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAdminOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getAdminOrders(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    // --- Users ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAdminUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<UserDto> users = userService.getAllUsers(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String roleStr = body.get("role");
        Role newRole = Role.valueOf(roleStr.toUpperCase());
        userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(ApiResponse.success(null, "User role updated successfully"));
    }

    // --- Coupons ---
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<PageResponse<CouponResponse>>> getAdminCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<CouponResponse> coupons = couponService.getAllCoupons(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon created successfully"));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request
    ) {
        CouponResponse coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon updated successfully"));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Coupon deleted successfully"));
    }

    // --- Downloads Audit ---
    @GetMapping("/downloads")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getAdminDownloads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<Map<String, Object>> downloads = downloadService.getAdminDownloads(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(downloads));
    }
}
