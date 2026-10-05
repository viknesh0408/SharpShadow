package com.sharpshadow.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStats {
    private long totalProducts;
    private long totalOrders;
    private long totalCustomers;
    private BigDecimal totalRevenue;
    private BigDecimal todaySales;
    private long totalDownloads;
    private long totalPngProducts;
    private long totalPngDownloads;
    private long freePngCount;

    // Charts data
    private List<Map<String, Object>> salesByDay;
    private List<Map<String, Object>> revenueByMonth;
    private List<ProductResponse> popularProducts;
}
