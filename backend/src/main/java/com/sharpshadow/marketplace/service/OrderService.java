package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.*;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.payment.RazorpayService;
import com.sharpshadow.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DownloadRepository downloadRepository;
    private final RazorpayService razorpayService;
    private final CouponService couponService;
    private final EntityDtoMapper mapper;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.isEmpty()) {
            throw new BadRequestException("No valid products found for order");
        }

        // Check if any product is already purchased by this user
        for (Product product : products) {
            if (orderRepository.existsByUserIdAndProductIdAndStatus(userId, product.getId(), OrderStatus.PAID)) {
                throw new BadRequestException("You have already purchased: " + product.getTitle());
            }
        }

        // Compute total from DATABASE prices
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (Product product : products) {
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            totalAmount = totalAmount.add(price);
        }

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            ApplyCouponResponse couponResult = couponService.validateAndApplyCoupon(request.getCouponCode(), request.getProductIds());
            totalAmount = couponResult.getFinalTotal();
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            totalAmount = BigDecimal.valueOf(1.00); // Minimum nominal Razorpay charge
        }

        String orderNumber = "SS-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now()) + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create Razorpay order
        String razorpayOrderId = razorpayService.createRazorpayOrder(orderNumber, totalAmount);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .totalAmount(totalAmount)
                .currency("INR")
                .status(OrderStatus.CREATED)
                .razorpayOrderId(razorpayOrderId)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (Product product : products) {
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .price(price)
                    .build();
            items.add(item);
        }
        orderItemRepository.saveAll(items);
        savedOrder.setItems(items);

        return mapper.toOrderResponse(savedOrder, user, razorpayService.getKeyId());
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.of(orders.map(o -> mapper.toOrderResponse(o, user, razorpayService.getKeyId())));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber, Long currentUserId, boolean isAdmin) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        if (!isAdmin && !order.getUserId().equals(currentUserId)) {
            throw new BadRequestException("Access denied: Not your order");
        }

        User user = userRepository.findById(order.getUserId()).orElse(null);
        return mapper.toOrderResponse(order, user, razorpayService.getKeyId());
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAdminOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        Map<Long, User> userCache = new HashMap<>();

        return PageResponse.of(orders.map(order -> {
            User user = userCache.computeIfAbsent(order.getUserId(), id -> userRepository.findById(id).orElse(null));
            return mapper.toOrderResponse(order, user, razorpayService.getKeyId());
        }));
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        BigDecimal totalRevenue = orderRepository.sumTotalPaidRevenue();
        BigDecimal todaySales = orderRepository.sumPaidRevenueSince(LocalDate.now().atStartOfDay());
        long totalDownloads = downloadRepository.count();

        // 7-day sales chart
        List<Map<String, Object>> salesByDay = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            BigDecimal dayRevenue = orderRepository.sumPaidRevenueSince(start);
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", date.format(dayFormatter));
            dayMap.put("sales", dayRevenue != null ? dayRevenue : BigDecimal.ZERO);
            salesByDay.add(dayMap);
        }

        // Monthly revenue chart
        List<Map<String, Object>> revenueByMonth = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i);
            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("month", monthDate.format(monthFormatter));
            monthMap.put("revenue", BigDecimal.valueOf(Math.max(1200, 3500 * (i + 1)))); // Sample trend
            revenueByMonth.add(monthMap);
        }

        // Popular products
        List<ProductResponse> popular = productRepository.findTopPopular(PageRequest.of(0, 5)).stream()
                .map(p -> mapper.toProductResponse(p, false, true))
                .collect(Collectors.toList());

        return AdminDashboardStats.builder()
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .todaySales(todaySales != null ? todaySales : BigDecimal.ZERO)
                .totalDownloads(totalDownloads)
                .salesByDay(salesByDay)
                .revenueByMonth(revenueByMonth)
                .popularProducts(popular)
                .build();
    }
}
