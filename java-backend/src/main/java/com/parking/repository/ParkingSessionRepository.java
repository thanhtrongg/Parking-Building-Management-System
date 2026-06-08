package com.parking.repository;

import com.parking.entity.ParkingSession;
import com.parking.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {

    Page<ParkingSession> findByDriverId(UUID driverId, Pageable pageable);

    boolean existsByLicensePlateAndStatusIn(String licensePlate, List<SessionStatus> statuses);

    @Query(value = "SELECT s FROM ParkingSession s " +
           "LEFT JOIN FETCH s.slot sl " +
           "LEFT JOIN FETCH s.driver d " +
           "LEFT JOIN FETCH s.staffIn si " +
           "LEFT JOIN FETCH s.staffOut so " +
           "WHERE d.id = :driverId",
           countQuery = "SELECT COUNT(s) FROM ParkingSession s WHERE s.driver.id = :driverId")
    Page<ParkingSession> findByDriverIdWithFetch(@Param("driverId") UUID driverId, Pageable pageable);

    List<ParkingSession> findByStatus(SessionStatus status);

    long countByStatus(SessionStatus status);

    Optional<ParkingSession> findByTicketCode(String ticketCode);

    List<ParkingSession> findBySlotIdAndStatus(UUID slotId, SessionStatus status);

    @Query("SELECT s FROM ParkingSession s LEFT JOIN FETCH s.slot sl LEFT JOIN FETCH sl.floor f LEFT JOIN FETCH f.building b " +
           "WHERE s.checkInTime >= :startDate AND s.checkInTime <= :endDate " +
           "AND (:buildingId IS NULL OR b.id = :buildingId)")
    List<ParkingSession> findSessionsWithinPeriod(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("buildingId") UUID buildingId
    );

    @Query(value = "SELECT s FROM ParkingSession s " +
           "LEFT JOIN FETCH s.slot sl " +
           "LEFT JOIN FETCH s.driver d " +
           "LEFT JOIN FETCH s.staffIn si " +
           "LEFT JOIN FETCH s.staffOut so " +
           "WHERE (:startDate IS NULL OR s.checkInTime >= :startDate) " +
           "AND (:endDate IS NULL OR s.checkInTime <= :endDate) " +
           "AND (:buildingId IS NULL OR sl.floor.building.id = :buildingId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:licensePlate IS NULL OR LOWER(s.licensePlate) LIKE LOWER(CONCAT('%', :licensePlate, '%')))",
           countQuery = "SELECT COUNT(s) FROM ParkingSession s " +
           "WHERE (:startDate IS NULL OR s.checkInTime >= :startDate) " +
           "AND (:endDate IS NULL OR s.checkInTime <= :endDate) " +
           "AND (:buildingId IS NULL OR s.slot.floor.building.id = :buildingId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:licensePlate IS NULL OR LOWER(s.licensePlate) LIKE LOWER(CONCAT('%', :licensePlate, '%')))")
    Page<ParkingSession> searchSessions(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("buildingId") UUID buildingId,
        @Param("status") SessionStatus status,
        @Param("licensePlate") String licensePlate,
        Pageable pageable
    );
}
