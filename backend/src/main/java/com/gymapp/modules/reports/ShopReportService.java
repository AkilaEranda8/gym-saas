package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.modules.shop.repository.ShopOrderRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopReportService {

    private final ShopOrderRepository shopOrderRepository;

    @Transactional(readOnly = true)
    public ShopReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId    = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        Long totalRev  = shopOrderRepository.sumRevenueBetween(gymId, dtFrom, dtTo);
        long revLkr    = totalRev != null ? totalRev : 0L;
        Long ordersRaw = shopOrderRepository.countByGymIdAndCreatedAtBetween(gymId, dtFrom, dtTo);
        long orders    = ordersRaw != null ? ordersRaw : 0L;
        long avg       = orders > 0 ? revLkr / orders : 0L;

        // Top products
        List<Object[]> topRaw = shopOrderRepository.getTopSellingProducts(gymId, dtFrom, dtTo, 10);
        List<TopProductStatDTO> topProducts = new ArrayList<>();
        for (int i = 0; i < topRaw.size(); i++) {
            Object[] row   = topRaw.get(i);
            UUID pid       = UUID.fromString(row[0].toString());
            String pname   = row[1] != null ? row[1].toString() : "Unknown";
            String catName = row[2] != null ? row[2].toString() : "N/A";
            long qty       = ((Number) row[3]).longValue();
            long rev       = ((Number) row[4]).longValue();
            topProducts.add(new TopProductStatDTO(pid, pname, catName, i + 1, qty, rev, 0L, 0.0));
        }

        // Daily sales
        List<Object[]> dailyRaw = shopOrderRepository.getDailySales(gymId, dtFrom, dtTo);
        List<DailySaleDTO> dailySales = new ArrayList<>();
        for (Object[] row : dailyRaw) {
            LocalDate saleDate = LocalDate.parse(row[0].toString());
            long orderCount    = ((Number) row[1]).longValue();
            long saleRev       = ((Number) row[2]).longValue();
            dailySales.add(new DailySaleDTO(saleDate, saleRev, orderCount));
        }

        return new ShopReportDTO(
            from, to, revLkr, orders, avg, 0L, 0L,
            topProducts, List.of(), dailySales, List.of(), 0L
        );
    }
}
