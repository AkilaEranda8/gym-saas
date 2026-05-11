package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.multitenancy.TenantContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class DiscountServiceTest {

    @Mock DiscountRepository discountRepo;

    @InjectMocks DiscountService discountService;

    static final UUID GYM_ID      = UUID.randomUUID();
    static final UUID DISCOUNT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── create ────────────────────────────────────────────────────

    @Test
    void create_WhenUniqueCode_ShouldSaveAndReturnDTO() {
        CreateDiscountRequest req = new CreateDiscountRequest(
            "SAVE20", "20% off", DiscountType.PERCENTAGE, 20L,
            100, LocalDate.now(), LocalDate.now().plusDays(30)
        );
        Discount saved = buildDiscount("SAVE20", DiscountType.PERCENTAGE, 20L, true);

        given(discountRepo.existsByGymIdAndCode(GYM_ID, "SAVE20")).willReturn(false);
        given(discountRepo.save(any(Discount.class))).willReturn(saved);

        DiscountDTO result = discountService.create(req);

        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("SAVE20");
        assertThat(result.discountType()).isEqualTo(DiscountType.PERCENTAGE);
        verify(discountRepo).save(any(Discount.class));
    }

    @Test
    void create_WhenDuplicateCode_ShouldThrowIllegalArgumentException() {
        CreateDiscountRequest req = new CreateDiscountRequest(
            "EXISTING", "Duplicate", DiscountType.FIXED, 500L,
            null, LocalDate.now(), null
        );
        given(discountRepo.existsByGymIdAndCode(GYM_ID, "EXISTING")).willReturn(true);

        assertThatThrownBy(() -> discountService.create(req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");

        verify(discountRepo, never()).save(any());
    }

    @Test
    void create_ShouldUppercaseCode() {
        CreateDiscountRequest req = new CreateDiscountRequest(
            "summer10", "Summer discount", DiscountType.PERCENTAGE, 10L,
            null, LocalDate.now(), null
        );
        Discount saved = buildDiscount("SUMMER10", DiscountType.PERCENTAGE, 10L, true);

        given(discountRepo.existsByGymIdAndCode(GYM_ID, "SUMMER10")).willReturn(false);
        given(discountRepo.save(any(Discount.class))).willReturn(saved);

        discountService.create(req);

        ArgumentCaptor<Discount> captor = ArgumentCaptor.forClass(Discount.class);
        verify(discountRepo).save(captor.capture());
        assertThat(captor.getValue().getCode()).isEqualTo("SUMMER10");
    }

    // ── validate ──────────────────────────────────────────────────

    @Test
    void validate_WhenValidPercentageCode_ShouldReturnCorrectDiscountAmount() {
        Discount discount = buildDiscount("PERC10", DiscountType.PERCENTAGE, 10L, true);
        ValidateDiscountRequest req = new ValidateDiscountRequest("PERC10", 100000L);

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "PERC10")).willReturn(Optional.of(discount));

        DiscountValidationDTO result = discountService.validate(req);

        assertThat(result.valid()).isTrue();
        assertThat(result.discountLkr()).isEqualTo(10000L);
        assertThat(result.finalAmountLkr()).isEqualTo(90000L);
    }

    @Test
    void validate_WhenValidFixedCode_ShouldDeductFixedAmount() {
        Discount discount = buildDiscount("FLAT500", DiscountType.FIXED, 50000L, true);
        ValidateDiscountRequest req = new ValidateDiscountRequest("FLAT500", 100000L);

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "FLAT500")).willReturn(Optional.of(discount));

        DiscountValidationDTO result = discountService.validate(req);

        assertThat(result.valid()).isTrue();
        assertThat(result.discountLkr()).isEqualTo(50000L);
        assertThat(result.finalAmountLkr()).isEqualTo(50000L);
    }

    @Test
    void validate_WhenFixedAmountExceedsBill_ShouldCapAtBillAmount() {
        Discount discount = buildDiscount("BIG500", DiscountType.FIXED, 200000L, true);
        ValidateDiscountRequest req = new ValidateDiscountRequest("BIG500", 100000L);

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "BIG500")).willReturn(Optional.of(discount));

        DiscountValidationDTO result = discountService.validate(req);

        assertThat(result.discountLkr()).isEqualTo(100000L);
        assertThat(result.finalAmountLkr()).isEqualTo(0L);
    }

    @Test
    void validate_WhenCodeNotFound_ShouldReturnInvalid() {
        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "GHOST")).willReturn(Optional.empty());

        DiscountValidationDTO result = discountService.validate(new ValidateDiscountRequest("GHOST", 100000L));

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).containsIgnoringCase("not found");
    }

    @Test
    void validate_WhenCodeExpired_ShouldReturnInvalid() {
        Discount expired = buildDiscount("OLD", DiscountType.PERCENTAGE, 10L, true);
        expired.setValidUntil(LocalDate.now().minusDays(1));

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "OLD")).willReturn(Optional.of(expired));

        DiscountValidationDTO result = discountService.validate(new ValidateDiscountRequest("OLD", 100000L));

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).containsIgnoringCase("expired");
    }

    @Test
    void validate_WhenMaxUsesReached_ShouldReturnInvalid() {
        Discount maxed = buildDiscount("MAXED", DiscountType.PERCENTAGE, 10L, true);
        maxed.setMaxUses(5);
        maxed.setUsedCount(5);

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "MAXED")).willReturn(Optional.of(maxed));

        DiscountValidationDTO result = discountService.validate(new ValidateDiscountRequest("MAXED", 100000L));

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).containsIgnoringCase("usage limit");
    }

    @Test
    void validate_WhenNotYetValid_ShouldReturnInvalid() {
        Discount future = buildDiscount("FUTURE", DiscountType.PERCENTAGE, 10L, true);
        future.setValidFrom(LocalDate.now().plusDays(5));

        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "FUTURE")).willReturn(Optional.of(future));

        DiscountValidationDTO result = discountService.validate(new ValidateDiscountRequest("FUTURE", 100000L));

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).containsIgnoringCase("not yet valid");
    }

    // ── toggleActive ──────────────────────────────────────────────

    @Test
    void toggleActive_WhenActive_ShouldSetInactive() {
        Discount d = buildDiscount("TOGGLE", DiscountType.PERCENTAGE, 10L, true);
        given(discountRepo.findByIdAndGymId(DISCOUNT_ID, GYM_ID)).willReturn(Optional.of(d));
        given(discountRepo.save(any())).willReturn(d);

        discountService.toggleActive(DISCOUNT_ID);

        assertThat(d.getIsActive()).isFalse();
    }

    @Test
    void toggleActive_WhenInactive_ShouldSetActive() {
        Discount d = buildDiscount("TOGGLE2", DiscountType.PERCENTAGE, 10L, false);
        given(discountRepo.findByIdAndGymId(DISCOUNT_ID, GYM_ID)).willReturn(Optional.of(d));
        given(discountRepo.save(any())).willReturn(d);

        discountService.toggleActive(DISCOUNT_ID);

        assertThat(d.getIsActive()).isTrue();
    }

    @Test
    void toggleActive_WhenNotFound_ShouldThrowNoSuchElementException() {
        given(discountRepo.findByIdAndGymId(DISCOUNT_ID, GYM_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> discountService.toggleActive(DISCOUNT_ID))
            .isInstanceOf(NoSuchElementException.class);
    }

    // ── delete ────────────────────────────────────────────────────

    @Test
    void delete_WhenExists_ShouldSoftDeleteBySettingDeletedAt() {
        Discount d = buildDiscount("DEL", DiscountType.FIXED, 1000L, true);
        given(discountRepo.findByIdAndGymId(DISCOUNT_ID, GYM_ID)).willReturn(Optional.of(d));
        given(discountRepo.save(any())).willReturn(d);

        discountService.delete(DISCOUNT_ID);

        assertThat(d.getDeletedAt()).isNotNull();
        verify(discountRepo).save(d);
    }

    @Test
    void delete_WhenNotFound_ShouldThrowNoSuchElementException() {
        given(discountRepo.findByIdAndGymId(DISCOUNT_ID, GYM_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> discountService.delete(DISCOUNT_ID))
            .isInstanceOf(NoSuchElementException.class);
    }

    // ── listActive ────────────────────────────────────────────────

    @Test
    void listActive_ShouldReturnOnlyActiveDiscounts() {
        Discount d1 = buildDiscount("A1", DiscountType.PERCENTAGE, 10L, true);
        Discount d2 = buildDiscount("A2", DiscountType.FIXED, 500L, true);
        given(discountRepo.findAllByGymIdAndIsActiveTrue(GYM_ID)).willReturn(List.of(d1, d2));

        List<DiscountDTO> result = discountService.listActive();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(dto -> dto.isActive());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Discount buildDiscount(String code, DiscountType type, long value, boolean active) {
        Discount d = new Discount();
        d.setId(DISCOUNT_ID);
        d.setGymId(GYM_ID);
        d.setCode(code);
        d.setDiscountType(type);
        d.setDiscountValue(value);
        d.setIsActive(active);
        d.setValidFrom(LocalDate.now().minusDays(30));
        d.setValidUntil(LocalDate.now().plusDays(30));
        d.setUsedCount(0);
        return d;
    }
}
