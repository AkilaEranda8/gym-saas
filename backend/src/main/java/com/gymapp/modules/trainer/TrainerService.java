package com.gymapp.modules.trainer;

import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.trainer.dto.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository              trainerRepository;
    private final TrainerSpecialtyRepository     specialtyRepository;
    private final TrainerCertificationRepository certificationRepository;
    private final TrainerAvailabilityRepository  availabilityRepository;
    private final TrainerAssignmentRepository    assignmentRepository;
    private final TrainerSessionRepository       sessionRepository;
    private final TrainerReviewRepository        reviewRepository;
    private final TrainerLeaveRepository         leaveRepository;
    private final MemberRepository               memberRepository;
    private final TrainerNotificationService     notificationService;

    @Transactional(readOnly = true)
    public Page<TrainerDTO> getAll(int page, int size, TrainerStatus status,
                                    UUID branchId, TrainerSpecialty specialty) {
        UUID gymId   = TenantContext.getGymId();
        var  pageable = PageRequest.of(page, size, Sort.by("name"));
        Page<Trainer> trainers = trainerRepository.findAllByGymIdWithFilters(gymId, status, branchId, pageable);
        return trainers.map(t -> toDTO(t, gymId));
    }

    @Transactional(readOnly = true)
    public TrainerDetailDTO getById(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Trainer t  = trainerRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));

        List<CertificationDTO> certs = certificationRepository.findAllByTrainerId(id)
                .stream().map(this::toCertDTO).toList();

        List<AvailabilityDTO> avail = availabilityRepository.findAllByTrainerId(id)
                .stream().map(this::toAvailDTO).toList();

        List<AssignmentDTO> assignments = assignmentRepository
                .findAllByTrainerIdAndStatus(id, AssignmentStatus.ACTIVE)
                .stream().map(a -> toAssignmentDTO(a, t.getName())).toList();

        List<PTSessionDTO> sessions = sessionRepository
                .findAllByTrainerIdAndSessionDateBetween(id, LocalDate.now().minusDays(30), LocalDate.now())
                .stream().limit(5).map(s -> toPTSessionDTO(s, t.getName())).toList();

        Page<TrainerReview> reviewPage = reviewRepository
                .findAllByTrainerIdOrderByCreatedAtDesc(id, PageRequest.of(0, 5));
        List<ReviewDTO> reviews = reviewPage.stream().map(this::toReviewDTO).toList();

        boolean onLeave = !leaveRepository.findActiveLeaveByTrainerId(id, LocalDate.now()).isEmpty();
        long activeClients = assignmentRepository.countByTrainerIdAndStatus(id, AssignmentStatus.ACTIVE);

        TrainerMonthlyStatsDTO monthly = buildMonthlyStats(t, YearMonth.now());

        return new TrainerDetailDTO(
            t.getId(), t.getGymId(), t.getBranchId(),
            t.getName(), t.getEmail(), t.getPhone(), t.getNic(), t.getPhotoUrl(), t.getBio(),
            t.getStatus(), t.getEmploymentType(),
            primarySpecialty(t), specialtyNames(t),
            t.getExperienceYears(),
            t.getRating() != null ? String.format("%.1f", t.getRating()) : "0.0",
            t.getTotalReviews(), t.getSalaryLkr(), t.getJoinedDate(),
            activeClients, certs, avail, assignments, sessions, reviews, monthly, onLeave);
    }

    @Transactional
    public TrainerDTO create(CreateTrainerRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (trainerRepository.existsByGymIdAndEmail(gymId, req.email()))
            throw new IllegalStateException("Trainer with this email already exists");
        if (req.phone() != null && trainerRepository.existsByGymIdAndPhone(gymId, req.phone()))
            throw new IllegalStateException("Trainer with this phone already exists");

        Trainer t = new Trainer();
        t.setGymId(gymId);
        t.setName(req.name());
        t.setEmail(req.email());
        t.setPhone(req.phone());
        t.setNic(req.nic());
        t.setBio(req.bio());
        t.setExperienceYears(req.experienceYears() != null ? req.experienceYears() : 0);
        t.setEmploymentType(req.employmentType());
        t.setBranchId(req.branchId());
        t.setSalaryLkr(req.salaryLkr());
        t.setJoinedDate(req.joinedDate());
        t.setStatus(TrainerStatus.ACTIVE);
        trainerRepository.save(t);

        if (req.specialties() != null) {
            saveSpecialties(t, req.specialties());
        }
        if (req.certificationNames() != null) {
            req.certificationNames().forEach(name -> {
                TrainerCertification c = new TrainerCertification();
                c.setGymId(gymId);
                c.setTrainerId(t.getId());
                c.setName(name);
                certificationRepository.save(c);
            });
        }
        if (req.availability() != null) {
            saveAvailability(t, req.availability());
        }

        notificationService.sendWelcomeMessage(t);
        return toDTO(t, gymId);
    }

    @Transactional
    public TrainerDTO update(UUID id, UpdateTrainerRequest req) {
        UUID gymId = TenantContext.getGymId();
        Trainer t  = trainerRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));

        if (req.name()           != null) t.setName(req.name());
        if (req.phone()          != null) t.setPhone(req.phone());
        if (req.nic()            != null) t.setNic(req.nic());
        if (req.bio()            != null) t.setBio(req.bio());
        if (req.experienceYears()!= null) t.setExperienceYears(req.experienceYears());
        if (req.employmentType() != null) t.setEmploymentType(req.employmentType());
        if (req.branchId()       != null) t.setBranchId(req.branchId());
        if (req.salaryLkr()      != null) t.setSalaryLkr(req.salaryLkr());
        if (req.joinedDate()     != null) t.setJoinedDate(req.joinedDate());
        if (req.status()         != null) t.setStatus(req.status());

        if (req.specialties() != null) {
            specialtyRepository.deleteAllByTrainerId(id);
            saveSpecialties(t, req.specialties());
        }
        if (req.availability() != null) {
            availabilityRepository.deleteAllByTrainerId(id);
            saveAvailability(t, req.availability());
        }
        return toDTO(trainerRepository.save(t), gymId);
    }

    @Transactional
    public void delete(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Trainer t  = trainerRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        long active = assignmentRepository.countByTrainerIdAndStatus(id, AssignmentStatus.ACTIVE);
        if (active > 0)
            throw new IllegalStateException("Trainer has " + active + " active client assignment(s). Complete or cancel them first.");
        t.setDeletedAt(LocalDateTime.now());
        t.setStatus(TrainerStatus.INACTIVE);
        trainerRepository.save(t);
    }

    @Transactional
    public CertificationDTO addCertification(UUID trainerId, AddCertificationRequest req) {
        UUID gymId = TenantContext.getGymId();
        trainerRepository.findByIdAndGymId(trainerId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        TrainerCertification c = new TrainerCertification();
        c.setGymId(gymId);
        c.setTrainerId(trainerId);
        c.setName(req.name());
        c.setIssuingBody(req.issuingBody());
        c.setIssuedDate(req.issuedDate());
        c.setExpiryDate(req.expiryDate());
        c.setCertificateUrl(req.certificateUrl());
        return toCertDTO(certificationRepository.save(c));
    }

    @Transactional
    public CertificationDTO verifyCertification(UUID certId) {
        TrainerCertification c = certificationRepository.findById(certId)
                .orElseThrow(() -> new NoSuchElementException("Certification not found"));
        c.setIsVerified(true);
        return toCertDTO(certificationRepository.save(c));
    }

    @Transactional
    public List<AvailabilityDTO> setAvailability(UUID trainerId, List<AvailabilityRequest> requests) {
        UUID gymId = TenantContext.getGymId();
        trainerRepository.findByIdAndGymId(trainerId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        availabilityRepository.deleteAllByTrainerId(trainerId);
        Trainer t = trainerRepository.findById(trainerId).orElseThrow();
        saveAvailability(t, requests);
        return availabilityRepository.findAllByTrainerId(trainerId)
                .stream().map(this::toAvailDTO).toList();
    }

    @Transactional(readOnly = true)
    public TrainerScheduleDTO getDaySchedule(UUID trainerId, LocalDate date) {
        UUID gymId = TenantContext.getGymId();
        Trainer t  = trainerRepository.findByIdAndGymId(trainerId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        List<TrainerSession> sessions = sessionRepository.findByTrainerIdAndSessionDate(trainerId, date);
        List<PTSessionDTO>   dtos     = sessions.stream().map(s -> toPTSessionDTO(s, t.getName())).toList();
        int dayOfWeek = date.getDayOfWeek().getValue();
        boolean available = availabilityRepository.findByTrainerIdAndDayOfWeek(trainerId, dayOfWeek)
                .map(TrainerAvailability::getIsAvailable).orElse(false);
        boolean onLeave = !leaveRepository.findActiveLeaveByTrainerId(trainerId, date).isEmpty();
        return new TrainerScheduleDTO(trainerId, t.getName(), date, dtos, available, onLeave);
    }

    @Transactional(readOnly = true)
    public TrainerStatsDTO getStats() {
        UUID gymId   = TenantContext.getGymId();
        long total   = trainerRepository.countByGymIdAndDeletedAtIsNull(gymId);
        long active  = trainerRepository.countByGymIdAndStatus(gymId, TrainerStatus.ACTIVE);
        long onLeave = trainerRepository.countByGymIdAndStatus(gymId, TrainerStatus.ON_LEAVE);

        List<Trainer> all = trainerRepository.findAllByGymIdAndStatus(gymId, TrainerStatus.ACTIVE);
        double avgRating  = all.stream()
                .filter(t -> t.getRating() != null)
                .mapToDouble(t -> t.getRating().doubleValue()).average().orElse(0.0);

        long totalClients = all.stream()
                .mapToLong(t -> assignmentRepository.countByTrainerIdAndStatus(t.getId(), AssignmentStatus.ACTIVE))
                .sum();

        Trainer topRated = all.stream()
                .filter(t -> t.getRating() != null)
                .max(Comparator.comparing(Trainer::getRating)).orElse(null);

        Trainer mostActive = all.stream()
                .max(Comparator.comparingLong(t ->
                    sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.COMPLETED)))
                .orElse(null);

        return new TrainerStatsDTO(
            total, active, onLeave, avgRating, totalClients,
            topRated   != null ? topRated.getName()   : "N/A",
            topRated   != null ? topRated.getRating().doubleValue() : 0.0,
            mostActive != null ? mostActive.getName() : "N/A",
            mostActive != null ? sessionRepository.countByTrainerIdAndStatus(
                mostActive.getId(), PTSessionStatus.COMPLETED) : 0L);
    }

    @Transactional(readOnly = true)
    public List<TrainerDTO> getAvailableForSlot(LocalDate date, java.time.LocalTime time, TrainerSpecialty specialty) {
        UUID gymId    = TenantContext.getGymId();
        int  dayOfWeek = date.getDayOfWeek().getValue();
        List<TrainerAvailability> available = availabilityRepository.findAvailableTrainersForSlot(gymId, dayOfWeek, time);
        return available.stream()
            .map(a -> trainerRepository.findById(a.getTrainerId()).orElse(null))
            .filter(t -> t != null)
            .filter(t -> t.getStatus() == TrainerStatus.ACTIVE)
            .filter(t -> leaveRepository.findActiveLeaveByTrainerId(t.getId(), date).isEmpty())
            .filter(t -> specialty == null || specialtyNames(t).contains(specialty.name()))
            .map(t -> toDTO(t, gymId))
            .toList();
    }

    private TrainerMonthlyStatsDTO buildMonthlyStats(Trainer t, YearMonth month) {
        long completed = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.COMPLETED);
        long cancelled = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.CANCELLED);
        long noShow    = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.NO_SHOW);
        long clients   = assignmentRepository.countByTrainerIdAndStatus(t.getId(), AssignmentStatus.ACTIVE);
        double avgRat  = reviewRepository.getAverageRatingByTrainerId(t.getId()) != null
                       ? reviewRepository.getAverageRatingByTrainerId(t.getId()) : 0.0;
        return new TrainerMonthlyStatsDTO(t.getId(), t.getName(), month,
            completed, cancelled, noShow, clients, 0, avgRat, 0);
    }

    private void saveSpecialties(Trainer t, List<TrainerSpecialty> specialties) {
        for (int i = 0; i < specialties.size(); i++) {
            TrainerSpecialtyEntity se = new TrainerSpecialtyEntity();
            se.setGymId(t.getGymId());
            se.setTrainerId(t.getId());
            se.setSpecialty(specialties.get(i));
            se.setIsPrimary(i == 0);
            specialtyRepository.save(se);
        }
    }

    private void saveAvailability(Trainer t, List<AvailabilityRequest> requests) {
        requests.forEach(r -> {
            TrainerAvailability a = new TrainerAvailability();
            a.setGymId(t.getGymId());
            a.setTrainerId(t.getId());
            a.setDayOfWeek(r.dayOfWeek());
            a.setStartTime(r.startTime());
            a.setEndTime(r.endTime());
            a.setIsAvailable(r.isAvailable());
            availabilityRepository.save(a);
        });
    }

    private TrainerDTO toDTO(Trainer t, UUID gymId) {
        long activeClients = assignmentRepository.countByTrainerIdAndStatus(t.getId(), AssignmentStatus.ACTIVE);
        return new TrainerDTO(
            t.getId(), t.getGymId(), t.getBranchId(),
            t.getName(), t.getEmail(), t.getPhone(), t.getPhotoUrl(),
            t.getStatus(), t.getEmploymentType(),
            primarySpecialty(t), specialtyNames(t),
            t.getExperienceYears(),
            t.getRating() != null ? String.format("%.1f", t.getRating()) : "0.0",
            t.getTotalReviews(), activeClients, 0L, t.getJoinedDate());
    }

    private String primarySpecialty(Trainer t) {
        return t.getSpecialtyList() == null || t.getSpecialtyList().isEmpty()
            ? null
            : t.getSpecialtyList().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsPrimary()))
                .findFirst()
                .or(() -> t.getSpecialtyList().stream().findFirst())
                .map(s -> s.getSpecialty().name())
                .orElse(null);
    }

    private List<String> specialtyNames(Trainer t) {
        if (t.getSpecialtyList() == null) return List.of();
        return t.getSpecialtyList().stream().map(s -> s.getSpecialty().name()).toList();
    }

    CertificationDTO toCertDTO(TrainerCertification c) {
        boolean expired  = c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDate.now());
        long daysUntil   = c.getExpiryDate() != null
                ? java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), c.getExpiryDate()) : 0;
        return new CertificationDTO(c.getId(), c.getTrainerId(), c.getName(), c.getIssuingBody(),
            c.getIssuedDate(), c.getExpiryDate(), c.getCertificateUrl(),
            Boolean.TRUE.equals(c.getIsVerified()), expired, daysUntil);
    }

    AvailabilityDTO toAvailDTO(TrainerAvailability a) {
        return new AvailabilityDTO(a.getId(), a.getTrainerId(), a.getDayOfWeek(),
            AvailabilityDTO.toDayName(a.getDayOfWeek()), a.getStartTime(), a.getEndTime(),
            Boolean.TRUE.equals(a.getIsAvailable()));
    }

    AssignmentDTO toAssignmentDTO(TrainerAssignment a, String trainerName) {
        String memberName  = memberRepository.findById(a.getMemberId())
                .map(m -> m.getFirstName() + " " + m.getLastName()).orElse("Unknown");
        String memberPhone = memberRepository.findById(a.getMemberId())
                .map(com.gymapp.modules.member.Member::getPhone).orElse(null);
        int remaining = (a.getSessionsTotal() != null ? a.getSessionsTotal() : 0)
                      - (a.getSessionsUsed()  != null ? a.getSessionsUsed()  : 0);
        int progress  = a.getSessionsTotal() != null && a.getSessionsTotal() > 0
                      ? (int) (((double) (a.getSessionsUsed() != null ? a.getSessionsUsed() : 0)
                                / a.getSessionsTotal()) * 100) : 0;
        return new AssignmentDTO(a.getId(), a.getTrainerId(), a.getMemberId(),
            trainerName, memberName, memberPhone, a.getAssignmentType(), a.getStatus(),
            a.getStartedDate(), a.getEndedDate(),
            a.getSessionsTotal(), a.getSessionsUsed(), remaining, progress, a.getNotes());
    }

    PTSessionDTO toPTSessionDTO(TrainerSession s, String trainerName) {
        String memberName = memberRepository.findById(s.getMemberId())
                .map(m -> m.getFirstName() + " " + m.getLastName()).orElse("Unknown");
        long duration = java.time.temporal.ChronoUnit.MINUTES.between(s.getStartTime(), s.getEndTime());
        return new PTSessionDTO(s.getId(), s.getTrainerId(), s.getMemberId(), s.getAssignmentId(),
            trainerName, memberName, s.getSessionDate(), s.getStartTime(), s.getEndTime(),
            duration, s.getStatus(), s.getNotes(), s.getMemberFeedback(), s.getTrainerNotes());
    }

    ReviewDTO toReviewDTO(TrainerReview r) {
        String name = Boolean.TRUE.equals(r.getIsAnonymous()) ? "Anonymous"
                    : memberRepository.findById(r.getMemberId())
                        .map(m -> m.getFirstName() + " " + m.getLastName()).orElse("Member");
        return new ReviewDTO(r.getId(), r.getTrainerId(), r.getMemberId(),
            name, r.getRating(), r.getReviewText(), r.getCreatedAt(),
            ReviewDTO.buildStarDisplay(r.getRating()));
    }
}
