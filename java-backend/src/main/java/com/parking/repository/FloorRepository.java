package com.parking.repository;

import com.parking.entity.Floor;
import com.parking.enums.VehicleTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

@Repository
public interface FloorRepository extends JpaRepository<Floor, UUID> {

    List<Floor> findByBuildingId(UUID buildingId);

    List<Floor> findByBuildingIdAndVehicleType(UUID buildingId, VehicleTypeEnum vehicleType);

    @Query("SELECT DISTINCT f FROM Floor f LEFT JOIN FETCH f.slots s LEFT JOIN FETCH f.building b WHERE (:buildingId IS NULL OR b.id = :buildingId)")
    List<Floor> findFloorsWithSlots(@Param("buildingId") UUID buildingId);
}
