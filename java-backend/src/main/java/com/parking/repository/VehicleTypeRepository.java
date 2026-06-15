package com.parking.repository;

import com.parking.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {

    Optional<VehicleType> findByName(String name);

    boolean existsByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT vt FROM Pricing pr JOIN pr.vehicleType vt WHERE pr.building.id = :buildingId")
    List<VehicleType> findByBuildingId(@org.springframework.data.repository.query.Param("buildingId") UUID buildingId);
}
