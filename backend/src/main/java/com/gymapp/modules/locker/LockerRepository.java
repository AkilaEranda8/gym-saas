package com.gymapp.modules.locker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LockerRepository extends JpaRepository<Locker, UUID> {

    List<Locker> findAllByGymId(UUID gymId);
    List<Locker> findAllByGymIdAndBranchId(UUID gymId, UUID branchId);
    List<Locker> findAllByGymIdAndStatus(UUID gymId, Locker.LockerStatus status);
    Optional<Locker> findByIdAndGymId(UUID id, UUID gymId);
    boolean existsByLockerNumberAndGymId(String lockerNumber, UUID gymId);
}
