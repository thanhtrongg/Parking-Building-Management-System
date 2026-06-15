package com.parking.repository;

import com.parking.entity.Reservation;
import com.parking.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parking.enums.VehicleTypeEnum;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByDriverId(UUID driverId);

    List<Reservation> findBySlotIdAndStatus(UUID slotId, ReservationStatus status);

    boolean existsBySlotId(UUID slotId);

    List<Reservation> findBySlotIdAndStatusIn(UUID slotId, List<ReservationStatus> statuses);

    @Query("SELECT r FROM Reservation r WHERE r.slot.id IN :slotIds " +
           "AND r.status IN ('PENDING', 'CONFIRMED') " +
           "AND r.reservedFrom < :endTime AND r.reservedTo > :startTime")
    List<Reservation> findOverlappingReservations(
        @Param("slotIds") List<UUID> slotIds,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.slot s " +
           "WHERE r.building.id = :buildingId AND r.vehicleType = :vehicleType " +
           "AND r.status IN ('PENDING', 'CONFIRMED') " +
           "AND r.reservedFrom < :endTime AND r.reservedTo > :startTime")
    List<Reservation> findOverlappingReservationsByBuildingAndVehicleType(
        @Param("buildingId") UUID buildingId,
        @Param("vehicleType") VehicleTypeEnum vehicleType,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<Reservation> findByStatus(ReservationStatus status);

    List<Reservation> findByBuildingId(UUID buildingId);

    List<Reservation> findByStatusAndBuildingId(ReservationStatus status, UUID buildingId);

    List<Reservation> findByDriverIdAndBuildingId(UUID driverId, UUID buildingId);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.slot WHERE r.status IN ('PENDING', 'CONFIRMED') AND r.reservedTo < :now")
    List<Reservation> findExpiredActiveReservations(@Param("now") LocalDateTime now);
}
