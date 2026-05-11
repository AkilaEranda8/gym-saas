package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PersonalRecordService {

    private final PersonalRecordRepository prRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutMapper mapper;

    public List<PersonalRecordResponse> listForMember(UUID memberId) {
        return prRepository.findAllByGymIdAndMemberIdOrderByAchievedDateDesc(TenantContext.getGymId(), memberId)
            .stream().map(mapper::toPrResponse).toList();
    }

    public PersonalRecordResponse get(UUID id) {
        return mapper.toPrResponse(
            prRepository.findByIdAndGymId(id, TenantContext.getGymId())
                .orElseThrow(() -> new NoSuchElementException("Personal record not found"))
        );
    }

    @Transactional
    public PersonalRecordResponse save(UUID memberId, CreatePersonalRecordRequest req) {
        UUID gymId = TenantContext.getGymId();
        Exercise ex = exerciseRepository.findByIdAndDeletedAtIsNull(req.exerciseId())
            .orElseThrow(() -> new NoSuchElementException("Exercise not found"));

        PersonalRecord pr = prRepository.findByMemberIdAndExerciseIdAndRecordType(
                memberId, req.exerciseId(), req.recordType())
            .orElse(new PersonalRecord());

        boolean isNew = pr.getId() == null;
        if (!isNew && pr.getValue().compareTo(req.value()) >= 0) {
            return mapper.toPrResponse(pr);
        }

        pr.setGymId(gymId);
        pr.setMemberId(memberId);
        pr.setExercise(ex);
        pr.setRecordType(req.recordType());
        pr.setValue(req.value());
        pr.setUnit(req.unit());
        pr.setAchievedDate(req.achievedDate());
        pr.setNotes(req.notes());
        return mapper.toPrResponse(prRepository.save(pr));
    }

    @Transactional
    public void delete(UUID id) {
        PersonalRecord pr = prRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Personal record not found"));
        prRepository.delete(pr);
    }
}
