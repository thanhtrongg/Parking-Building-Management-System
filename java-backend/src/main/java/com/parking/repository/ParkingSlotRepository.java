package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, UUID> {

    List<ParkingSlot> findByFloorId(UUID floorId);

    List<ParkingSlot> findByFloorIdAndStatus(UUID floorId, SlotStatus status);

    long countByFloorIdAndStatus(UUID floorId, SlotStatus status);
}
