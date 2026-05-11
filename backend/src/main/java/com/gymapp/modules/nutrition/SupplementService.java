package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplementService {

    private final SupplementScheduleRepository supplementRepository;
    private final NutritionMapper mapper;

    public List<SupplementScheduleDTO> getMemberSupplements(UUID memberId) {
        return supplementRepository.findAllByMemberIdAndActiveTrue(memberId)
            .stream().map(mapper::toSupplementDTO).toList();
    }

    @Transactional
    public SupplementScheduleDTO addSupplement(UUID memberId, AddSupplementRequest req) {
        UUID gymId = TenantContext.getGymId();
        SupplementSchedule s = new SupplementSchedule();
        s.setGymId(gymId);
        s.setMemberId(memberId);
        s.setSupplementName(req.supplementName());
        s.setDosage(req.dosage());
        s.setTiming(req.timing());
        s.setNotes(req.notes());
        s.setActive(true);
        return mapper.toSupplementDTO(supplementRepository.save(s));
    }

    @Transactional
    public void deleteSupplement(UUID id) {
        UUID gymId = TenantContext.getGymId();
        SupplementSchedule s = supplementRepository.findById(id)
            .filter(sup -> sup.getGymId().equals(gymId))
            .orElseThrow(() -> new NoSuchElementException("Supplement not found"));
        s.setActive(false);
        supplementRepository.save(s);
    }
}
