package com.parking.repository;

import com.parking.entity.ParkingBuilding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingBuildingRepository extends JpaRepository<ParkingBuilding, UUID> {

    List<ParkingBuilding> findByIsActiveTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM ParkingBuilding b WHERE b.id = :id")
    Optional<ParkingBuilding> findByIdWithWriteLock(@Param("id") UUID id);
}
