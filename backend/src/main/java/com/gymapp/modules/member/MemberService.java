package com.gymapp.modules.member;

import com.gymapp.modules.member.dto.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository     memberRepository;
    private final PlanRepository       planRepository;
    private final MemberPlanRepository memberPlanRepository;
    private final BodyMetricRepository bodyMetricRepository;
    private final AttendanceRepository attendanceRepository;
    private final QrCodeService        qrCodeService;

    // ── List ──────────────────────────────────────────────────

    public Page<MemberResponse> listMembers(String search, MemberStatus status,
                                             UUID branchId, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        String normalizedSearch = (search != null && !search.isBlank()) ? search.toLowerCase() : "";
        return memberRepository.searchMembers(gymId, normalizedSearch, status, branchId, pageable)
            .map(MemberResponse::from);
    }

    public Page<MemberResponse> listMembers(Pageable pageable) {
        return listMembers(null, null, null, pageable);
    }

    // ── Get one ───────────────────────────────────────────────

    public MemberResponse getMember(UUID id) {
        return memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .map(MemberResponse::from)
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
    }

    public MemberDetailDTO getMemberDetail(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Member m = memberRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Member not found"));

        BodyMetricDTO latestMetric = bodyMetricRepository
            .findTopByMemberIdOrderByRecordedDateDesc(id)
            .map(BodyMetricDTO::from)
            .orElse(null);

        List<AttendanceDTO> recentAttendance = attendanceRepository
            .findTop10ByGymIdAndMemberIdOrderByCheckInTimeDesc(gymId, id)
            .stream().map(AttendanceDTO::from).toList();

        return new MemberDetailDTO(
            m.getId(), m.getGymId(), m.getBranchId(),
            m.getFirstName(), m.getLastName(),
            m.getFirstName() + " " + m.getLastName(),
            m.getEmail(), m.getPhone(), m.getNic(), m.getPhotoUrl(),
            m.getDateOfBirth(), m.getGender(), m.getAddress(),
            m.getStatus(), m.getJoinDate(), m.getExpiryDate(),
            m.getQrCode(), m.getLockerId(),
            m.getNutritionPlanId(), m.getNotes(), m.getCreatedAt(),
            latestMetric, recentAttendance
        );
    }

    // ── Stats ─────────────────────────────────────────────────

    public MemberStatsDTO getStats() {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd   = today.atTime(LocalTime.MAX);

        long total      = memberRepository.countByGymId(gymId);
        long active     = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.ACTIVE);
        long expiring   = memberRepository.findExpiringMembers(gymId, today, today.plusDays(7)).size();
        long expired    = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.EXPIRED);
        long checkedIn  = attendanceRepository.countDistinctMembersByGymIdAndCheckInTimeBetween(gymId, dayStart, dayEnd);
        long newMonth   = memberRepository.countByGymIdAndJoinDateAfter(gymId, today.withDayOfMonth(1));

        return new MemberStatsDTO(total, active, expiring, expired, checkedIn, newMonth);
    }

    // ── Create ────────────────────────────────────────────────

    @Transactional
    public MemberResponse createMember(MemberRequest request) {
        UUID gymId = TenantContext.getGymId();
        if (memberRepository.existsByEmailAndGymId(request.email(), gymId)) {
            throw new IllegalStateException("A member with this email already exists");
        }
        if (request.phone() != null && memberRepository.existsByPhoneAndGymId(request.phone(), gymId)) {
            throw new IllegalStateException("A member with this phone already exists");
        }
        Member member = new Member();
        member.setGymId(gymId);
        member.setJoinDate(LocalDate.now());
        member.setExpiryDate(LocalDate.now().plusDays(30));
        member.setStatus(MemberStatus.ACTIVE);
        applyRequest(request, member);

        member = memberRepository.save(member);
        String qrData = qrCodeService.generateMemberQrData(member.getId().toString(), gymId.toString());
        member.setQrCode(qrData);
        return MemberResponse.from(memberRepository.save(member));
    }

    // ── Update ────────────────────────────────────────────────

    @Transactional
    public MemberResponse updateMember(UUID id, MemberRequest request) {
        Member member = memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        applyRequest(request, member);
        return MemberResponse.from(memberRepository.save(member));
    }

    // ── Delete (soft) ─────────────────────────────────────────

    @Transactional
    public void deleteMember(UUID id) {
        Member member = memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        member.setDeletedAt(LocalDateTime.now());
        member.setStatus(MemberStatus.INACTIVE);
        memberRepository.save(member);
    }

    // ── Suspend / Reactivate ──────────────────────────────────

    @Transactional
    public MemberResponse suspendMember(UUID id) {
        Member member = memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        member.setStatus(MemberStatus.SUSPENDED);
        return MemberResponse.from(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse reactivateMember(UUID id) {
        Member member = memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        member.setStatus(MemberStatus.ACTIVE);
        return MemberResponse.from(memberRepository.save(member));
    }

    // ── QR Code ───────────────────────────────────────────────

    public byte[] generateQrCodeImage(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Member member = memberRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        String data = qrCodeService.generateMemberQrData(member.getId().toString(), gymId.toString());
        return qrCodeService.generate(data, 300, 300);
    }

    public String getQrCode(UUID id) {
        Member member = memberRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        return member.getQrCode();
    }

    // ── Check-in ──────────────────────────────────────────────

    @Transactional
    public CheckInResponse checkIn(CheckInRequest req) {
        UUID gymId = TenantContext.getGymId();
        Member member;
        if (req.qrCode() != null && !req.qrCode().isBlank()) {
            String memberId = req.qrCode().contains(":") ? req.qrCode().split(":")[1] : req.qrCode();
            member = memberRepository.findByIdAndGymId(UUID.fromString(memberId), gymId)
                .orElseThrow(() -> new NoSuchElementException("Member not found for QR code"));
        } else if (req.memberId() != null) {
            member = memberRepository.findByIdAndGymId(req.memberId(), gymId)
                .orElseThrow(() -> new NoSuchElementException("Member not found"));
        } else {
            throw new IllegalArgumentException("Provide qrCode or memberId");
        }

        if (member.getStatus() == MemberStatus.EXPIRED) {
            return new CheckInResponse(member.getId(),
                member.getFirstName() + " " + member.getLastName(),
                null, "EXPIRED", null, "Membership expired. Please renew.", false);
        }

        boolean alreadyIn = attendanceRepository
            .findByGymIdAndMemberIdAndCheckOutTimeIsNull(gymId, member.getId())
            .isPresent();
        if (alreadyIn) {
            return new CheckInResponse(member.getId(),
                member.getFirstName() + " " + member.getLastName(),
                null, member.getStatus().name(), LocalDateTime.now(),
                "Already checked in.", false);
        }

        Attendance attendance = new Attendance();
        attendance.setGymId(gymId);
        attendance.setMemberId(member.getId());
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setCheckInMethod(req.method() != null ? req.method() : CheckInMethod.MANUAL);
        attendanceRepository.save(attendance);

        return new CheckInResponse(member.getId(),
            member.getFirstName() + " " + member.getLastName(),
            null, member.getStatus().name(), attendance.getCheckInTime(),
            "Check-in successful! Welcome back, " + member.getFirstName() + "! 💪", true);
    }

    @Transactional
    public void checkOut(UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        Attendance attendance = attendanceRepository
            .findByGymIdAndMemberIdAndCheckOutTimeIsNull(gymId, memberId)
            .orElseThrow(() -> new NoSuchElementException("No active check-in found"));
        attendance.setCheckOutTime(LocalDateTime.now());
        attendanceRepository.save(attendance);
    }

    // ── Body Metrics ──────────────────────────────────────────

    @Transactional
    public BodyMetricDTO addBodyMetric(UUID memberId, AddBodyMetricRequest req) {
        UUID gymId = TenantContext.getGymId();
        memberRepository.findByIdAndGymId(memberId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Member not found"));

        BodyMetric metric = new BodyMetric();
        metric.setGymId(gymId);
        metric.setMemberId(memberId);
        metric.setWeightKg(req.weightKg());
        metric.setHeightCm(req.heightCm());
        metric.setBodyFatPct(req.bodyFatPct());
        metric.setMuscleMassKg(req.muscleMassKg());
        metric.setChestCm(req.chestCm());
        metric.setWaistCm(req.waistCm());
        metric.setHipCm(req.hipCm());
        metric.setNotes(req.notes());
        metric.setRecordedDate(LocalDate.now());

        if (req.weightKg() != null && req.heightCm() != null && req.heightCm().doubleValue() > 0) {
            double hM = req.heightCm().doubleValue() / 100.0;
            double bmi = req.weightKg().doubleValue() / (hM * hM);
            metric.setBmi(BigDecimal.valueOf(bmi).round(new MathContext(4)));
        }

        return BodyMetricDTO.from(bodyMetricRepository.save(metric));
    }

    public List<BodyMetricDTO> getBodyMetrics(UUID memberId) {
        return bodyMetricRepository.findTop12ByMemberIdOrderByRecordedDateDesc(memberId)
            .stream().map(BodyMetricDTO::from).toList();
    }

    // ── Attendance ────────────────────────────────────────────

    public Page<AttendanceDTO> getAttendance(UUID memberId, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return attendanceRepository.findAllByGymIdAndMemberIdOrderByCheckInTimeDesc(gymId, memberId, pageable)
            .map(AttendanceDTO::from);
    }

    // ── Expiring list ─────────────────────────────────────────

    public List<MemberResponse> getExpiringMembers(int days) {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        return memberRepository.findExpiringMembers(gymId, today, today.plusDays(days))
            .stream().map(MemberResponse::from).toList();
    }

    // ── Assign plan ───────────────────────────────────────────

    @Transactional
    public MemberPlan assignPlan(UUID memberId, AssignPlanRequest request) {
        UUID gymId = TenantContext.getGymId();
        Member member = memberRepository.findByIdAndGymId(memberId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Member not found"));
        Plan plan = planRepository.findByIdAndGymId(request.planId(), gymId)
            .orElseThrow(() -> new NoSuchElementException("Plan not found"));

        memberPlanRepository.findByMemberIdAndGymIdAndStatus(memberId, gymId, MemberPlan.MemberPlanStatus.ACTIVE)
            .ifPresent(existing -> {
                existing.setStatus(MemberPlan.MemberPlanStatus.CANCELLED);
                memberPlanRepository.save(existing);
            });

        MemberPlan mp = new MemberPlan();
        mp.setGymId(gymId);
        mp.setMemberId(memberId);
        mp.setPlanId(plan.getId());
        mp.setPlanName(plan.getName());
        mp.setStartDate(request.startDate());
        mp.setEndDate(request.startDate().plusDays(plan.getDurationDays()));
        mp.setPrice(plan.getPrice());
        mp.setStatus(MemberPlan.MemberPlanStatus.ACTIVE);

        member.setStatus(MemberStatus.ACTIVE);
        member.setExpiryDate(mp.getEndDate());
        memberRepository.save(member);

        return memberPlanRepository.save(mp);
    }

    // ── Helpers ───────────────────────────────────────────────

    private void applyRequest(MemberRequest r, Member m) {
        m.setFirstName(r.firstName());
        m.setLastName(r.lastName());
        m.setEmail(r.email());
        m.setPhone(r.phone());
        m.setDateOfBirth(r.dateOfBirth());
        m.setGender(r.gender());
        m.setAddress(r.address());
        m.setBranchId(r.branchId());
        m.setEmergencyContactName(r.emergencyContactName());
        m.setEmergencyContactPhone(r.emergencyContactPhone());
        m.setNotes(r.notes());
    }
}
