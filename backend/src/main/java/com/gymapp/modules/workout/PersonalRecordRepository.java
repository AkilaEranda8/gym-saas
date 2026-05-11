package com.gymapp.modules.workout;

import com.gymapp.modules.workout.enums.PersonalRecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, UUID> {

    List<PersonalRecord> findAllByGymIdAndMemberIdOrderByAchievedDateDesc(UUID gymId, UUID memberId);

    Optional<PersonalRecord> findByMemberIdAndExerciseIdAndRecordType(UUID memberId, UUID exerciseId, PersonalRecordType recordType);

    Optional<PersonalRecord> findByIdAndGymId(UUID id, UUID gymId);

    @Query("SELECT pr FROM PersonalRecord pr WHERE pr.gymId = :gymId AND pr.memberId = :memberId AND pr.exercise.id = :exerciseId")
    List<PersonalRecord> findAllForExercise(@Param("gymId") UUID gymId, @Param("memberId") UUID memberId, @Param("exerciseId") UUID exerciseId);

    long countByGymIdAndMemberId(UUID gymId, UUID memberId);
}
