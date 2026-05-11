package com.gymapp.modules.locker;

import com.gymapp.modules.locker.LockerDtos.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LockerService {

    private final LockerRepository           lockerRepository;
    private final LockerAssignmentRepository assignmentRepository;
    private final MemberRepository           memberRepository;

    // ── Locker CRUD ───────────────────────────────────────────────────────────

    public List<LockerDTO> listLockers() {
        UUID gymId    = TenantContext.getGymId();
        UUID branchId = TenantContext.getBranchId();
        List<Locker> lockers = branchId != null
            ? lockerRepository.findAllByGymIdAndBranchId(gymId, branchId)
            : lockerRepository.findAllByGymId(gymId);
        return lockers.stream().map(l -> toLockerDTO(l, gymId)).toList();
    }

    public List<LockerDTO> listAvailableLockers() {
        UUID gymId = TenantContext.getGymId();
        return lockerRepository.findAllByGymIdAndStatus(gymId, Locker.LockerStatus.AVAILABLE)
            .stream().map(l -> toLockerDTO(l, gymId)).toList();
    }

    @Transactional
    public LockerDTO createLocker(CreateLockerRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (lockerRepository.existsByLockerNumberAndGymId(req.lockerNumber(), gymId)) {
            throw new IllegalStateException("Locker number already exists");
        }
        Locker locker = new Locker();
        locker.setGymId(gymId);
        locker.setBranchId(req.branchId());
        locker.setLockerNumber(req.lockerNumber());
        locker.setSize(req.size() != null ? Locker.LockerSize.valueOf(req.size()) : Locker.LockerSize.MEDIUM);
        locker.setMonthlyRate(req.monthlyRate());
        locker.setStatus(Locker.LockerStatus.AVAILABLE);
        return toLockerDTO(lockerRepository.save(locker), gymId);
    }

    @Transactional
    public LockerDTO updateLocker(UUID id, UpdateLockerRequest req) {
        UUID gymId = TenantContext.getGymId();
        Locker locker = lockerRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Locker not found"));
        if (req.lockerNumber() != null) locker.setLockerNumber(req.lockerNumber());
        if (req.size() != null) locker.setSize(Locker.LockerSize.valueOf(req.size()));
        if (req.monthlyRate() != null) locker.setMonthlyRate(req.monthlyRate());
        if (req.status() != null) locker.setStatus(Locker.LockerStatus.valueOf(req.status()));
        return toLockerDTO(lockerRepository.save(locker), gymId);
    }

    @Transactional
    public void deleteLocker(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Locker locker = lockerRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Locker not found"));
        if (locker.getStatus() == Locker.LockerStatus.OCCUPIED) {
            throw new IllegalStateException("Cannot delete an occupied locker");
        }
        lockerRepository.delete(locker);
    }

    // ── Assignments ───────────────────────────────────────────────────────────

    @Transactional
    public LockerAssignmentDTO assignLocker(UUID lockerId, AssignLockerRequest req) {
        UUID gymId = TenantContext.getGymId();
        Locker locker = lockerRepository.findByIdAndGymId(lockerId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Locker not found"));
        if (locker.getStatus() != Locker.LockerStatus.AVAILABLE) {
            throw new IllegalStateException("Locker is not available");
        }
        LockerAssignment assignment = new LockerAssignment();
        assignment.setGymId(gymId);
        assignment.setLockerId(lockerId);
        assignment.setMemberId(req.memberId());
        assignment.setStartDate(LocalDate.now());
        assignment.setEndDate(req.endDate());
        assignment.setMonthlyRate(locker.getMonthlyRate());
        assignment.setStatus(LockerAssignment.AssignmentStatus.ACTIVE);
        locker.setStatus(Locker.LockerStatus.OCCUPIED);
        lockerRepository.save(locker);
        return toAssignmentDTO(assignmentRepository.save(assignment), locker);
    }

    @Transactional
    public void releaseLocker(UUID assignmentId) {
        LockerAssignment assignment = assignmentRepository.findByIdAndGymId(assignmentId, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        assignment.setStatus(LockerAssignment.AssignmentStatus.RELEASED);
        assignment.setEndDate(LocalDate.now());
        assignmentRepository.save(assignment);
        lockerRepository.findById(assignment.getLockerId()).ifPresent(l -> {
            l.setStatus(Locker.LockerStatus.AVAILABLE);
            lockerRepository.save(l);
        });
    }

    public List<LockerAssignmentDTO> listAssignments(String status) {
        UUID gymId = TenantContext.getGymId();
        List<LockerAssignment> assignments = status != null
            ? assignmentRepository.findAllByGymIdAndStatus(gymId, LockerAssignment.AssignmentStatus.valueOf(status))
            : assignmentRepository.findAllByGymId(gymId);
        Map<UUID, Locker> lockerCache = new HashMap<>();
        return assignments.stream().map(a -> {
            Locker l = lockerCache.computeIfAbsent(a.getLockerId(),
                lid -> lockerRepository.findById(lid).orElse(null));
            return toAssignmentDTO(a, l);
        }).toList();
    }

    public List<LockerAssignmentDTO> getMemberLockers(UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        return assignmentRepository.findAllByMemberIdAndGymId(memberId, gymId).stream()
            .map(a -> {
                Locker l = lockerRepository.findById(a.getLockerId()).orElse(null);
                return toAssignmentDTO(a, l);
            }).toList();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public LockerStatsDTO getStats() {
        UUID gymId = TenantContext.getGymId();
        long total       = lockerRepository.findAllByGymId(gymId).size();
        long available   = lockerRepository.findAllByGymIdAndStatus(gymId, Locker.LockerStatus.AVAILABLE).size();
        long occupied    = lockerRepository.findAllByGymIdAndStatus(gymId, Locker.LockerStatus.OCCUPIED).size();
        long maintenance = lockerRepository.findAllByGymIdAndStatus(gymId, Locker.LockerStatus.MAINTENANCE).size();
        long active      = assignmentRepository.countByGymIdAndStatus(gymId, LockerAssignment.AssignmentStatus.ACTIVE);
        long expiring    = assignmentRepository.findExpiringBetween(gymId, LocalDate.now(), LocalDate.now().plusDays(7)).size();
        BigDecimal revenue = assignmentRepository.findAllByGymIdAndStatus(gymId, LockerAssignment.AssignmentStatus.ACTIVE)
            .stream().map(LockerAssignment::getMonthlyRate)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new LockerStatsDTO(total, available, occupied, maintenance, active, expiring, revenue);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private LockerDTO toLockerDTO(Locker l, UUID gymId) {
        String memberName = null;
        UUID memberId     = null;
        LocalDate endDate = null;
        if (l.getStatus() == Locker.LockerStatus.OCCUPIED) {
            Optional<LockerAssignment> active = assignmentRepository
                .findByLockerIdAndStatus(l.getId(), LockerAssignment.AssignmentStatus.ACTIVE);
            if (active.isPresent()) {
                memberId = active.get().getMemberId();
                endDate  = active.get().getEndDate();
                memberName = memberRepository.findByIdAndGymId(memberId, gymId)
                    .map(m -> m.getFirstName() + " " + m.getLastName()).orElse(null);
            }
        }
        return new LockerDTO(l.getId(), l.getGymId(), l.getBranchId(),
            l.getLockerNumber(), l.getSize().name(), l.getMonthlyRate(),
            l.getStatus().name(), memberName, memberId, endDate);
    }

    private LockerAssignmentDTO toAssignmentDTO(LockerAssignment a, Locker locker) {
        String memberName   = memberRepository.findById(a.getMemberId())
            .map(m -> m.getFirstName() + " " + m.getLastName()).orElse("Unknown");
        String lockerNumber = locker != null ? locker.getLockerNumber() : "?";
        String lockerSize   = locker != null ? locker.getSize().name() : "?";
        boolean expired     = a.getEndDate() != null && a.getEndDate().isBefore(LocalDate.now())
                              && a.getStatus() == LockerAssignment.AssignmentStatus.ACTIVE;
        return new LockerAssignmentDTO(a.getId(), a.getLockerId(), lockerNumber, lockerSize,
            a.getMemberId(), memberName, a.getStartDate(), a.getEndDate(),
            a.getMonthlyRate(), a.getStatus().name(), expired);
    }
}
