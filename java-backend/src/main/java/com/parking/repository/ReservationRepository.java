package com.parking.repository;

import com.parking.entity.Reservation;
import com.parking.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByDriverId(UUID driverId);

    List<Reservation> findBySlotIdAndStatus(UUID slotId, ReservationStatus status);

    List<Reservation> findBySlotIdAndStatusIn(UUID slotId, List<ReservationStatus> statuses);

    @Query("SELECT r FROM Reservation r WHERE r.slot.id IN :slotIds " +
           "AND r.status IN ('PENDING', 'CONFIRMED') " +
           "AND r.reservedFrom < :endTime AND r.reservedTo > :startTime")
    List<Reservation> findOverlappingReservations(
        @Param("slotIds") List<UUID> slotIds,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<Reservation> findByStatus(ReservationStatus status);
}
