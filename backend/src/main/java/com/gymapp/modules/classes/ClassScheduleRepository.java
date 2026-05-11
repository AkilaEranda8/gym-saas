package com.gymapp.modules.classes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, UUID> {

    List<ClassSchedule> findAllByClassIdAndIsActiveTrue(UUID classId);

    List<ClassSchedule> findAllByGymIdAndDayOfWeek(UUID gymId, int dayOfWeek);

    List<ClassSchedule> findAllByGymId(UUID gymId);
}
