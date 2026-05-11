package com.gymapp.modules.member;

import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberExportService {

    private final MemberRepository memberRepository;

    public byte[] exportMembersCsv() {
        List<Member> members = memberRepository.findAllByGymId(
            TenantContext.getGymId(), org.springframework.data.domain.Pageable.unpaged()
        ).getContent();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.writeBytes(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

        try (PrintWriter pw = new PrintWriter(baos, true, StandardCharsets.UTF_8)) {
            pw.println("ID,First Name,Last Name,Email,Phone,NIC,Status,Joined,Expiry,Notes");
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            for (Member m : members) {
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    m.getId(),
                    safe(m.getFirstName()),
                    safe(m.getLastName()),
                    safe(m.getEmail()),
                    safe(m.getPhone()),
                    safe(m.getNic()),
                    m.getStatus(),
                    m.getJoinDate() != null ? m.getJoinDate().format(fmt) : "",
                    m.getExpiryDate() != null ? m.getExpiryDate().format(fmt) : "",
                    safe(m.getNotes())
                );
            }
        }
        return baos.toByteArray();
    }

    private String safe(String s) {
        if (s == null) return "";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
