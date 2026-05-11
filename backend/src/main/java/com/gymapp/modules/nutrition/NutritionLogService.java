package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NutritionLogService {

    private final NutritionLogRepository logRepository;
    private final MemberNutritionAssignmentRepository assignmentRepository;
    private final FoodItemRepository foodItemRepository;
    private final WaterLogRepository waterLogRepository;
    private final SupplementScheduleRepository supplementRepository;
    private final NutritionMapper mapper;

    public NutritionLogDetailDTO getTodayLog(UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        NutritionLog log = logRepository.findByMemberIdAndLogDate(memberId, today)
            .orElseGet(() -> {
                NutritionLog newLog = new NutritionLog();
                newLog.setGymId(gymId);
                newLog.setMemberId(memberId);
                newLog.setLogDate(today);
                return logRepository.save(newLog);
            });
        Integer target = getCalorieTarget(memberId);
        List<SupplementScheduleDTO> supplements = supplementRepository
            .findAllByMemberIdAndActiveTrue(memberId)
            .stream().map(mapper::toSupplementDTO).toList();
        return mapper.toLogDetailDTO(log, target, supplements);
    }

    public NutritionLogDetailDTO getLogByDate(UUID memberId, LocalDate date) {
        NutritionLog log = logRepository.findByMemberIdAndLogDate(memberId, date)
            .orElseThrow(() -> new NoSuchElementException("No log found for " + date));
        Integer target = getCalorieTarget(memberId);
        List<SupplementScheduleDTO> supplements = supplementRepository
            .findAllByMemberIdAndActiveTrue(memberId)
            .stream().map(mapper::toSupplementDTO).toList();
        return mapper.toLogDetailDTO(log, target, supplements);
    }

    public PageResponse<NutritionLogDTO> getMemberLogs(UUID memberId, LocalDate from, LocalDate to,
                                                         int page, int size) {
        Integer target = getCalorieTarget(memberId);
        var pg = logRepository.findByMemberIdAndDateRange(memberId, from, to, PageRequest.of(page, size));
        return PageResponse.from(pg.map(l -> mapper.toLogDTO(l, target)));
    }

    @Transactional
    public NutritionLogDetailDTO logNutrition(UUID memberId, LogNutritionRequest req) {
        UUID gymId = TenantContext.getGymId();
        LocalDate date = req.logDate() != null ? req.logDate() : LocalDate.now();

        NutritionLog log = logRepository.findByMemberIdAndLogDate(memberId, date)
            .orElseGet(() -> {
                NutritionLog newLog = new NutritionLog();
                newLog.setGymId(gymId);
                newLog.setMemberId(memberId);
                newLog.setLogDate(date);
                assignmentRepository.findFirstByMemberIdAndStatus(memberId, NutritionAssignmentStatus.ACTIVE)
                    .ifPresent(a -> newLog.setAssignmentId(a.getId()));
                return newLog;
            });

        if (req.waterMl()        != null) log.setWaterMl(req.waterMl());
        if (req.overallFeeling() != null) log.setOverallFeeling(req.overallFeeling());
        if (req.energyLevel()    != null) log.setEnergyLevel(req.energyLevel());
        if (req.notes()          != null) log.setNotes(req.notes());

        if (req.meals() != null) {
            for (LogMealRequest mr : req.meals()) {
                NutritionLogMeal meal = new NutritionLogMeal();
                meal.setGymId(gymId);
                meal.setMealName(mr.mealName());
                meal.setTimeOfDay(mr.timeOfDay());
                meal.setLoggedAt(mr.loggedAt() != null ? mr.loggedAt() : LocalDateTime.now());
                meal.setNotes(mr.notes());

                BigDecimal mealCals = BigDecimal.ZERO;
                BigDecimal mealPro  = BigDecimal.ZERO;
                BigDecimal mealCarb = BigDecimal.ZERO;
                BigDecimal mealFat  = BigDecimal.ZERO;

                if (mr.foodItems() != null) {
                    for (LogFoodItemRequest fir : mr.foodItems()) {
                        NutritionLogFoodItem lfi = new NutritionLogFoodItem();
                        lfi.setGymId(gymId);
                        lfi.setFoodName(fir.foodName());
                        lfi.setQuantityG(fir.quantityG());

                        if (fir.foodItemId() != null) {
                            foodItemRepository.findByIdAndGymId(UUID.fromString(fir.foodItemId()), gymId)
                                .ifPresent(food -> {
                                    lfi.setFoodItemId(food.getId());
                                    lfi.setCalories(food.getCaloriesForQuantity(fir.quantityG()));
                                    lfi.setProteinG(food.getProteinForQuantity(fir.quantityG()));
                                    lfi.setCarbsG(food.getCarbsForQuantity(fir.quantityG()));
                                    lfi.setFatG(food.getFatForQuantity(fir.quantityG()));
                                });
                        }
                        if (lfi.getCalories() == null) lfi.setCalories(BigDecimal.ZERO);
                        if (lfi.getProteinG() == null) lfi.setProteinG(BigDecimal.ZERO);
                        if (lfi.getCarbsG()   == null) lfi.setCarbsG(BigDecimal.ZERO);
                        if (lfi.getFatG()     == null) lfi.setFatG(BigDecimal.ZERO);

                        mealCals = mealCals.add(lfi.getCalories());
                        mealPro  = mealPro.add(lfi.getProteinG());
                        mealCarb = mealCarb.add(lfi.getCarbsG());
                        mealFat  = mealFat.add(lfi.getFatG());
                        meal.getFoodItems().add(lfi);
                    }
                }
                meal.setCalories(mealCals.setScale(0, RoundingMode.HALF_UP).intValue());
                meal.setProteinG(mealPro);
                meal.setCarbsG(mealCarb);
                meal.setFatG(mealFat);
                log.getMeals().add(meal);
            }
        }

        recalculateTotals(log);
        log.setUpdatedAt(LocalDateTime.now());
        logRepository.save(log);

        Integer target = getCalorieTarget(memberId);
        List<SupplementScheduleDTO> supplements = supplementRepository
            .findAllByMemberIdAndActiveTrue(memberId)
            .stream().map(mapper::toSupplementDTO).toList();
        return mapper.toLogDetailDTO(log, target, supplements);
    }

    public DailyWaterSummaryDTO getWaterSummary(UUID memberId, LocalDate date) {
        Integer total = waterLogRepository.sumWaterByMemberIdAndLogDate(memberId, date);
        Integer target = 2000;
        assignmentRepository.findFirstByMemberIdAndStatus(memberId, NutritionAssignmentStatus.ACTIVE)
            .ifPresent(a -> {});
        List<WaterLogDTO> logs = waterLogRepository.findAllByMemberIdAndLogDate(memberId, date)
            .stream().map(mapper::toWaterLogDTO).toList();
        double pct = target > 0 ? (double) total / target * 100 : 0;
        return new DailyWaterSummaryDTO(date, total, target, Math.min(pct, 100), logs);
    }

    @Transactional
    public WaterLogDTO logWater(UUID memberId, LogWaterRequest req) {
        UUID gymId = TenantContext.getGymId();
        WaterLog wl = new WaterLog();
        wl.setGymId(gymId);
        wl.setMemberId(memberId);
        wl.setLogDate(req.logDate() != null ? req.logDate() : LocalDate.now());
        wl.setAmountMl(req.amountMl());
        WaterLog saved = waterLogRepository.save(wl);

        logRepository.findByMemberIdAndLogDate(memberId, wl.getLogDate()).ifPresent(log -> {
            Integer existing = log.getWaterMl() != null ? log.getWaterMl() : 0;
            log.setWaterMl(existing + req.amountMl());
            log.setUpdatedAt(LocalDateTime.now());
            logRepository.save(log);
        });
        return mapper.toWaterLogDTO(saved);
    }

    public NutritionProgressDTO getProgress(UUID memberId, LocalDate from, LocalDate to) {
        List<NutritionLog> logs = logRepository.findAllByMemberIdAndLogDateBetweenOrderByLogDateDesc(
            memberId, from, to);
        Integer target = getCalorieTarget(memberId);

        List<DailyCalorieDTO> dailies = logs.stream()
            .map(l -> {
                int def = (target != null && l.getTotalCalories() != null) ? target - l.getTotalCalories() : 0;
                return new DailyCalorieDTO(l.getLogDate(), l.getTotalCalories(), target, def);
            }).collect(Collectors.toList());

        double avgCal  = logs.stream().filter(l -> l.getTotalCalories() != null)
            .mapToInt(NutritionLog::getTotalCalories).average().orElse(0);
        double avgPro  = logs.stream().filter(l -> l.getTotalProteinG() != null)
            .mapToDouble(l -> l.getTotalProteinG().doubleValue()).average().orElse(0);
        double avgCarb = logs.stream().filter(l -> l.getTotalCarbsG() != null)
            .mapToDouble(l -> l.getTotalCarbsG().doubleValue()).average().orElse(0);
        double avgFat  = logs.stream().filter(l -> l.getTotalFatG() != null)
            .mapToDouble(l -> l.getTotalFatG().doubleValue()).average().orElse(0);
        double avgWater = logs.stream().filter(l -> l.getWaterMl() != null)
            .mapToInt(NutritionLog::getWaterMl).average().orElse(0);

        return new NutritionProgressDTO(memberId, dailies, avgCal, avgPro, avgCarb, avgFat, avgWater);
    }

    private void recalculateTotals(NutritionLog log) {
        int totalCal  = 0;
        BigDecimal totalPro  = BigDecimal.ZERO;
        BigDecimal totalCarb = BigDecimal.ZERO;
        BigDecimal totalFat  = BigDecimal.ZERO;
        BigDecimal totalFib  = BigDecimal.ZERO;

        for (NutritionLogMeal meal : log.getMeals()) {
            totalCal  += meal.getCalories() != null ? meal.getCalories() : 0;
            totalPro  = totalPro.add(meal.getProteinG()  != null ? meal.getProteinG()  : BigDecimal.ZERO);
            totalCarb = totalCarb.add(meal.getCarbsG()   != null ? meal.getCarbsG()    : BigDecimal.ZERO);
            totalFat  = totalFat.add(meal.getFatG()      != null ? meal.getFatG()      : BigDecimal.ZERO);
        }
        log.setTotalCalories(totalCal);
        log.setTotalProteinG(totalPro);
        log.setTotalCarbsG(totalCarb);
        log.setTotalFatG(totalFat);
        log.setTotalFiberG(totalFib);
    }

    private Integer getCalorieTarget(UUID memberId) {
        return assignmentRepository.findFirstByMemberIdAndStatus(memberId, NutritionAssignmentStatus.ACTIVE)
            .map(MemberNutritionAssignment::getTargetCalories).orElse(null);
    }
}
