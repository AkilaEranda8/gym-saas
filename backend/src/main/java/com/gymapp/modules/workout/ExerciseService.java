package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.modules.workout.enums.ExerciseCategory;
import com.gymapp.modules.workout.enums.ExerciseEquipment;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutMapper mapper;

    public PageResponse<ExerciseResponse> list(ExerciseCategory category, ExerciseEquipment equipment,
                                                String search, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = exerciseRepository.findByFilters(gymId, category, equipment, search, PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toExerciseResponse));
    }

    public List<ExerciseResponse> listAll() {
        return exerciseRepository.findAllForGym(TenantContext.getGymId())
            .stream().map(mapper::toExerciseResponse).toList();
    }

    public ExerciseResponse get(UUID id) {
        return mapper.toExerciseResponse(
            exerciseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NoSuchElementException("Exercise not found"))
        );
    }

    @Transactional
    public ExerciseResponse create(CreateExerciseRequest req) {
        UUID gymId = TenantContext.getGymId();
        Exercise ex = new Exercise();
        ex.setGymId(gymId);
        ex.setName(req.name());
        ex.setDescription(req.description());
        ex.setCategory(req.category());
        ex.setMuscleGroups(req.muscleGroups());
        ex.setEquipment(req.equipment());
        ex.setDifficulty(req.difficulty() != null ? req.difficulty() : com.gymapp.modules.workout.enums.WorkoutLevel.BEGINNER);
        ex.setInstructions(req.instructions());
        ex.setTips(req.tips());
        ex.setVideoUrl(req.videoUrl());
        ex.setImageUrl(req.imageUrl());
        ex.setCustom(true);
        return mapper.toExerciseResponse(exerciseRepository.save(ex));
    }

    @Transactional
    public ExerciseResponse update(UUID id, CreateExerciseRequest req) {
        Exercise ex = exerciseRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new NoSuchElementException("Exercise not found"));
        if (ex.getGymId() == null) throw new IllegalStateException("Cannot modify global exercises");
        ex.setName(req.name());
        ex.setDescription(req.description());
        ex.setCategory(req.category());
        ex.setMuscleGroups(req.muscleGroups());
        ex.setEquipment(req.equipment());
        if (req.difficulty() != null) ex.setDifficulty(req.difficulty());
        ex.setInstructions(req.instructions());
        ex.setTips(req.tips());
        ex.setVideoUrl(req.videoUrl());
        ex.setImageUrl(req.imageUrl());
        return mapper.toExerciseResponse(exerciseRepository.save(ex));
    }

    @Transactional
    public void delete(UUID id) {
        Exercise ex = exerciseRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new NoSuchElementException("Exercise not found"));
        if (ex.getGymId() == null) throw new IllegalStateException("Cannot delete global exercises");
        ex.setDeletedAt(LocalDateTime.now());
        exerciseRepository.save(ex);
    }
}
