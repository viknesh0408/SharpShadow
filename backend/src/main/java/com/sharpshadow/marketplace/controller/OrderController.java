package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.ApiResponse;
import com.sharpshadow.marketplace.dto.CreateOrderRequest;
import com.sharpshadow.marketplace.dto.OrderResponse;
import com.sharpshadow.marketplace.dto.PageResponse;
import com.sharpshadow.marketplace.security.UserPrincipal;
import com.sharpshadow.marketplace.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse order = orderService.createOrder(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(order, "Order created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PageResponse<OrderResponse> orders = orderService.getUserOrders(principal.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        OrderResponse order = orderService.getOrderByOrderNumber(orderNumber, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
