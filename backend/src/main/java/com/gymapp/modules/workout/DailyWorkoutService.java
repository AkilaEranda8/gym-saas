package com.gymapp.modules.workout;

import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyWorkoutService {

    private final DailyWorkoutRepository repository;

    public record WodRequest(
        String title, String description, LocalDate workoutDate,
        String difficulty, Integer durationMinutes, String exercises, String notes
    ) {}

    @Transactional(readOnly = true)
    public Optional<DailyWorkout> getByDate(LocalDate date) {
        return repository.findByGymIdAndWorkoutDate(TenantContext.getGymId(), date);
    }

    @Transactional(readOnly = true)
    public List<DailyWorkout> getWeek(LocalDate from, LocalDate to) {
        return repository.findAllByGymIdAndWorkoutDateBetweenOrderByWorkoutDateAsc(
            TenantContext.getGymId(), from, to);
    }

    @Transactional
    public DailyWorkout upsert(WodRequest req) {
        UUID gymId = TenantContext.getGymId();
        DailyWorkout wod = repository.findByGymIdAndWorkoutDate(gymId, req.workoutDate())
            .orElseGet(() -> { DailyWorkout d = new DailyWorkout(); d.setGymId(gymId); return d; });
        wod.setTitle(req.title());
        wod.setDescription(req.description());
        wod.setWorkoutDate(req.workoutDate());
        wod.setDifficulty(req.difficulty());
        wod.setDurationMinutes(req.durationMinutes());
        wod.setExercises(req.exercises() != null ? req.exercises() : "[]");
        wod.setNotes(req.notes());
        return repository.save(wod);
    }

    @Transactional
    public void delete(UUID id) {
        DailyWorkout wod = repository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Daily workout not found"));
        repository.delete(wod);
    }
}
