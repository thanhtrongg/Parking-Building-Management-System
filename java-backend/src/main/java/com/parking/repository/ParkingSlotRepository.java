package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parking.enums.VehicleTypeEnum;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, UUID> {

    List<ParkingSlot> findByFloorId(UUID floorId);

    List<ParkingSlot> findByFloorIdAndStatus(UUID floorId, SlotStatus status);

    long countByFloorIdAndStatus(UUID floorId, SlotStatus status);

    @Query("SELECT s FROM ParkingSlot s JOIN FETCH s.floor f " +
           "WHERE f.building.id = :buildingId AND f.vehicleType = :vehicleType AND s.status = 'AVAILABLE'")
    List<ParkingSlot> findAvailableSlotsByBuildingAndVehicleType(
        @Param("buildingId") UUID buildingId,
        @Param("vehicleType") VehicleTypeEnum vehicleType
    );

    @Query("SELECT COUNT(s) FROM ParkingSlot s WHERE s.floor.building.id = :buildingId AND s.vehicleType = :vehicleType")
    long countByBuildingIdAndVehicleType(
        @Param("buildingId") UUID buildingId,
        @Param("vehicleType") VehicleTypeEnum vehicleType
    );
}
