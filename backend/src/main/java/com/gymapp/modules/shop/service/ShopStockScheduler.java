package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.dto.LowStockAlertDTO;
import com.gymapp.modules.shop.repository.ProductRepository;
import com.gymapp.modules.shop.repository.ShopOrderRepository;
import com.gymapp.modules.shop.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShopStockScheduler {

    private final ProductRepository productRepository;
    private final ShopNotificationService notificationService;
    private final ShopAnalyticsService analyticsService;

    @Scheduled(cron = "0 0 8 * * MON-FRI")
    public void checkLowStockAlerts() {
        log.info("[ShopStockScheduler] Checking low stock alerts");
        List<Product> lowStockProducts = productRepository.findAll().stream()
            .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getDeletedAt() == null
                && p.getStockQty() <= p.getMinStockQty())
            .toList();
        if (lowStockProducts.isEmpty()) return;

        List<LowStockAlertDTO> alerts = lowStockProducts.stream().map(p -> {
            String catName = p.getCategory() != null ? p.getCategory().getName() : null;
            String status  = p.getStockQty() == 0 ? "OUT_OF_STOCK" : "LOW";
            return new LowStockAlertDTO(p.getId(), p.getName(), catName, p.getSku(),
                p.getStockQty(), p.getMinStockQty(), status);
        }).toList();

        notificationService.sendLowStockAlert(alerts, "Gym");
        log.info("[ShopStockScheduler] Sent low stock alert for {} products", alerts.size());
    }

    @Scheduled(cron = "0 0 6 * * MON")
    public void weeklyShopReport() {
        log.info("[ShopStockScheduler] Generating weekly shop report");
        try {
            var summary = analyticsService.getSummary();
            log.info("[ShopStockScheduler] Week revenue: {}, orders: {}",
                summary.weekRevenue(), summary.weekOrders());
        } catch (Exception e) {
            log.error("[ShopStockScheduler] Weekly report error", e);
        }
    }
}
