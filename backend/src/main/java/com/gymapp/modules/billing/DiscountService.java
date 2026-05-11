package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepo;

    @Transactional
    public DiscountDTO create(CreateDiscountRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (discountRepo.existsByGymIdAndCode(gymId, req.code().toUpperCase())) {
            throw new IllegalArgumentException("Discount code already exists: " + req.code());
        }
        Discount d = new Discount();
        d.setGymId(gymId);
        d.setCode(req.code().toUpperCase());
        d.setDescription(req.description());
        d.setDiscountType(req.discountType());
        d.setDiscountValue(req.discountValue());
        d.setMaxUses(req.maxUses());
        d.setValidFrom(req.validFrom());
        d.setValidUntil(req.validUntil());
        return toDTO(discountRepo.save(d));
    }

    public Page<DiscountDTO> list(Pageable pageable) {
        return discountRepo.findAllByGymId(TenantContext.getGymId(), pageable).map(this::toDTO);
    }

    public List<DiscountDTO> listActive() {
        return discountRepo.findAllByGymIdAndIsActiveTrue(TenantContext.getGymId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DiscountDTO toggleActive(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Discount d = discountRepo.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Discount not found"));
        d.setIsActive(!d.getIsActive());
        return toDTO(discountRepo.save(d));
    }

    @Transactional
    public void delete(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Discount d = discountRepo.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Discount not found"));
        d.setDeletedAt(LocalDateTime.now());
        discountRepo.save(d);
    }

    public DiscountValidationDTO validate(ValidateDiscountRequest req) {
        UUID gymId = TenantContext.getGymId();
        Discount d = discountRepo.findByGymIdAndCodeAndIsActiveTrue(gymId, req.code().toUpperCase())
                .orElse(null);

        if (d == null) return invalid("Discount code not found");
        if (!d.getIsActive()) return invalid("Discount code is inactive");
        LocalDate now = LocalDate.now();
        if (now.isBefore(d.getValidFrom())) return invalid("Discount not yet valid");
        if (d.getValidUntil() != null && now.isAfter(d.getValidUntil())) return invalid("Discount has expired");
        if (d.getMaxUses() != null && d.getUsedCount() >= d.getMaxUses()) return invalid("Discount usage limit reached");

        long discountLkr = d.getDiscountType() == DiscountType.PERCENTAGE
                ? (long) (req.amountLkr() * d.getDiscountValue() / 100.0)
                : Math.min(d.getDiscountValue(), req.amountLkr());
        long finalAmount = req.amountLkr() - discountLkr;

        return new DiscountValidationDTO(true, d.getCode(), d.getDiscountType(),
                d.getDiscountValue(), discountLkr, finalAmount,
                "Discount applied: " + formatValue(d));
    }

    private DiscountValidationDTO invalid(String msg) {
        return new DiscountValidationDTO(false, null, null, null, null, null, msg);
    }

    private String formatValue(Discount d) {
        return d.getDiscountType() == DiscountType.PERCENTAGE
                ? d.getDiscountValue() + "% off"
                : "LKR " + String.format("%,.2f", d.getDiscountValue() / 100.0) + " off";
    }

    private DiscountDTO toDTO(Discount d) {
        Integer remaining = d.getMaxUses() != null ? d.getMaxUses() - d.getUsedCount() : null;
        boolean expired = d.getValidUntil() != null && LocalDate.now().isAfter(d.getValidUntil());
        return new DiscountDTO(d.getId(), d.getGymId(), d.getCode(), d.getDescription(),
                d.getDiscountType(), d.getDiscountValue(), d.getMaxUses(), d.getUsedCount(),
                remaining, d.getValidFrom(), d.getValidUntil(), d.getIsActive(), expired);
    }
}
