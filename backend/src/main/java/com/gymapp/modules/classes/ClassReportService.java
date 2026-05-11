package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.ClassStatsDTO;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassReportService {

    private final ClassSessionRepository  sessionRepository;
    private final ClassBookingRepository  bookingRepository;
    private final FitnessClassRepository  classRepository;
    private final com.gymapp.modules.trainer.TrainerRepository trainerRepository;
    private final MemberRepository        memberRepository;

    public ClassStatsDTO getMonthlyStats(LocalDate month) {
        UUID gymId       = TenantContext.getGymId();
        LocalDate from   = month.withDayOfMonth(1);
        LocalDate to     = month.withDayOfMonth(month.lengthOfMonth());

        long totalSessions   = sessionRepository.countByGymIdAndSessionDateBetween(gymId, from, to);
        long cancelled       = sessionRepository.countByGymIdAndSessionDateBetweenAndStatus(gymId, from, to, SessionStatus.CANCELLED);
        long totalBookings   = bookingRepository.countByGymIdAndBookedAtBetween(
            gymId, from.atStartOfDay(), to.atTime(23, 59));

        long totalClasses = classRepository.countByGymId(gymId);

        return new ClassStatsDTO(totalClasses, totalSessions, totalBookings, 0.0, null, null, cancelled);
    }

    public byte[] exportSessionsCsv(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        List<ClassSession> sessions = sessionRepository.findAllByGymIdAndSessionDateBetween(gymId, from, to);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(0xEF); out.write(0xBB); out.write(0xBF);

        try (PrintWriter pw = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            pw.println("Date,Class Name,Type,Trainer,Room,Capacity,Booked,Attended,No-Shows,Fill Rate %,Status");
            for (ClassSession s : sessions) {
                FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
                int booked   = sessionRepository.countBookedBySessionId(s.getId());
                long attended = bookingRepository.findAllBySessionIdAndStatus(s.getId(), BookingStatus.ATTENDED).size();
                long noShow   = bookingRepository.findAllBySessionIdAndStatus(s.getId(), BookingStatus.NO_SHOW).size();
                int fill     = s.getActualCapacity() > 0 ? (int) Math.round(booked * 100.0 / s.getActualCapacity()) : 0;
                String trainerName = fc != null && fc.getTrainerId() != null
                    ? trainerRepository.findById(fc.getTrainerId()).map(t -> t.getName()).orElse("")
                    : "";
                pw.printf("%s,%s,%s,%s,%s,%d,%d,%d,%d,%d%%,%s%n",
                    s.getSessionDate(),
                    fc != null ? escape(fc.getName()) : "",
                    fc != null ? fc.getType() : "",
                    trainerName,
                    fc != null && fc.getRoom() != null ? escape(fc.getRoom()) : "",
                    s.getActualCapacity(), booked, attended, noShow, fill,
                    s.getStatus());
            }
        }
        return out.toByteArray();
    }

    public byte[] exportBookingsCsv(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        List<ClassSession> sessions = sessionRepository.findAllByGymIdAndSessionDateBetween(gymId, from, to);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(0xEF); out.write(0xBB); out.write(0xBF);

        try (PrintWriter pw = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            pw.println("Date,Class,Member Name,Phone,Status,Booked At,Attended At");
            for (ClassSession s : sessions) {
                FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
                for (ClassBooking b : bookingRepository.findAllBySessionId(s.getId())) {
                    String memberName = memberRepository.findById(b.getMemberId())
                        .map(m -> m.getFirstName() + " " + m.getLastName()).orElse("");
                    String phone = memberRepository.findById(b.getMemberId())
                        .map(m -> m.getPhone() != null ? m.getPhone() : "").orElse("");
                    pw.printf("%s,%s,%s,%s,%s,%s,%s%n",
                        s.getSessionDate(),
                        fc != null ? escape(fc.getName()) : "",
                        escape(memberName), phone,
                        b.getStatus(),
                        b.getBookedAt(),
                        b.getAttendedAt() != null ? b.getAttendedAt() : "");
                }
            }
        }
        return out.toByteArray();
    }

    private String escape(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
