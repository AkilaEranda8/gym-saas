package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.enums.PurchaseOrderStatus;
import com.gymapp.modules.shop.repository.ProductRepository;
import com.gymapp.modules.shop.repository.PurchaseOrderRepository;
import com.gymapp.modules.shop.repository.ShopOrderRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ShopAnalyticsService {

    private final ShopOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository poRepository;

    private static final NumberFormat FMT;
    static {
        FMT = NumberFormat.getInstance(new Locale("en", "LK"));
        FMT.setGroupingUsed(true);
    }

    public String fmt(long lkr) { return "Rs. " + FMT.format(lkr); }

    public ShopSummaryDTO getSummary() {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime now   = LocalDateTime.now();
        LocalDateTime today = now.toLocalDate().atStartOfDay();
        LocalDateTime wkStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDateTime mthStart = today.withDayOfMonth(1);

        Long todayRev  = coalesce(orderRepository.sumRevenueByGymIdAndCreatedAtBetween(gymId, today, now));
        long todayOrd  = coalesce(orderRepository.countByGymIdAndCreatedAtBetween(gymId, today, now));
        Long weekRev   = coalesce(orderRepository.sumRevenueByGymIdAndCreatedAtBetween(gymId, wkStart, now));
        long weekOrd   = coalesce(orderRepository.countByGymIdAndCreatedAtBetween(gymId, wkStart, now));
        Long monthRev  = coalesce(orderRepository.sumRevenueByGymIdAndCreatedAtBetween(gymId, mthStart, now));
        long monthOrd  = coalesce(orderRepository.countByGymIdAndCreatedAtBetween(gymId, mthStart, now));
        long totalProd = productRepository.count();
        long lowStock  = productRepository.findLowStockByGymId(gymId).size();
        long outStock  = productRepository.findOutOfStockByGymId(gymId).size();
        long pendingPO = poRepository.countByGymIdAndStatus(gymId, PurchaseOrderStatus.PENDING);

        return new ShopSummaryDTO(todayOrd, fmt(todayRev), todayRev, weekOrd, fmt(weekRev), weekRev,
            monthOrd, fmt(monthRev), monthRev, totalProd, lowStock, outStock, pendingPO);
    }

    public List<TopProductDTO> getTopProducts(int days, int limit) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to   = LocalDateTime.now();
        List<Object[]> rows = orderRepository.getTopSellingProducts(gymId, from, to, limit);
        return rows.stream().map(r -> {
            UUID productId   = UUID.fromString(r[0].toString());
            String name      = r[1].toString();
            String catName   = r[2] != null ? r[2].toString() : null;
            long qtySold     = ((Number) r[3]).longValue();
            long revenue     = ((Number) r[4]).longValue();
            return new TopProductDTO(productId, name, catName, qtySold, revenue, fmt(revenue));
        }).toList();
    }

    public List<DailySalesDTO> getDailySales(int days) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to   = LocalDateTime.now();
        List<Object[]> rows = orderRepository.getDailySales(gymId, from, to);
        return rows.stream().map(r -> {
            String date   = r[0].toString();
            long orders   = ((Number) r[1]).longValue();
            long revenue  = ((Number) r[2]).longValue();
            long items    = r[3] != null ? ((Number) r[3]).longValue() : 0L;
            return new DailySalesDTO(date, orders, revenue, fmt(revenue), items);
        }).toList();
    }

    private long coalesce(Long val) { return val != null ? val : 0L; }
}
