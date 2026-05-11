package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import com.gymapp.modules.workout.enums.ExerciseCategory;
import com.gymapp.modules.workout.enums.ExerciseEquipment;
import com.gymapp.modules.workout.enums.WorkoutLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "exercises")
public class Exercise extends BaseEntity {

    @Column(name = "gym_id")
    private UUID gymId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExerciseCategory category;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "muscle_groups", columnDefinition = "text[]")
    private String[] muscleGroups;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ExerciseEquipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkoutLevel difficulty = WorkoutLevel.BEGINNER;

    @Column(columnDefinition = "text")
    private String instructions;

    @Column(columnDefinition = "text")
    private String tips;

    @Column(name = "video_url", length = 255)
    private String videoUrl;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "is_custom")
    private boolean custom = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
