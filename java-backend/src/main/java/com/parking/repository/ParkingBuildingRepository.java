package com.parking.repository;

import com.parking.entity.ParkingBuilding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingBuildingRepository extends JpaRepository<ParkingBuilding, UUID> {

    List<ParkingBuilding> findByIsActiveTrue();
}
