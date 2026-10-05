package com.sharpshadow.marketplace.mapper;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category, Long productCount) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .status(category.getStatus())
                .productCount(productCount != null ? productCount : 0L)
                .createdAt(category.getCreatedAt())
                .build();
    }

    public ProductResponse toProductResponse(Product product, Boolean hasPurchased, boolean isAdmin) {
        if (product == null) return null;

        var previews = product.getPreviewImages() != null
                ? product.getPreviewImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList())
                : new ArrayList<String>();

        boolean isFree = product.isFree();
        boolean userHasAccess = isFree || (hasPurchased != null && hasPurchased);

        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .category(toCategoryResponse(product.getCategory(), null))
                .thumbnailUrl(product.getThumbnailUrl())
                .fileName(product.getFileName())
                .fileSize(product.getFileSize())
                .dimensions(product.getDimensions())
                .resolution(product.getResolution())
                .colorMode(product.getColorMode())
                .photoshopVersion(product.getPhotoshopVersion())
                .featured(product.getFeatured())
                .status(product.getStatus())
                .downloadCount(product.getDownloadCount())
                .previewImages(previews)
                .hasPurchased(userHasAccess)
                .free(isFree)
                .isPng(product.isPng())
                .fileFormat(product.getFileFormat())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .internalFileUrl(isAdmin ? product.getFileUrl() : null)
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productTitle(item.getProduct() != null ? item.getProduct().getTitle() : null)
                .productSlug(item.getProduct() != null ? item.getProduct().getSlug() : null)
                .productThumbnail(item.getProduct() != null ? item.getProduct().getThumbnailUrl() : null)
                .price(item.getPrice())
                .build();
    }

    public OrderResponse toOrderResponse(Order order, User user, String razorpayKeyId) {
        if (order == null) return null;

        var items = order.getItems() != null
                ? order.getItems().stream().map(this::toOrderItemResponse).collect(Collectors.toList())
                : new ArrayList<OrderItemResponse>();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .userName(user != null ? user.getName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .razorpayOrderId(order.getRazorpayOrderId())
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .razorpayKeyId(razorpayKeyId)
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public PaymentResponse toPaymentResponse(Payment payment, String orderNumber) {
        if (payment == null) return null;
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderNumber(orderNumber)
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public CouponResponse toCouponResponse(Coupon coupon) {
        if (coupon == null) return null;
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minimumAmount(coupon.getMinimumAmount())
                .expiryDate(coupon.getExpiryDate())
                .usageLimit(coupon.getUsageLimit())
                .timesUsed(coupon.getTimesUsed())
                .status(coupon.getStatus())
                .build();
    }
}
