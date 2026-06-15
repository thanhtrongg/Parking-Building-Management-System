package com.parking.repository;

import com.parking.entity.Payment;
import com.parking.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findBySessionId(UUID sessionId);

    Optional<Payment> findBySessionIdAndStatus(UUID sessionId, PaymentStatus status);

    @Query("SELECT p FROM Payment p JOIN FETCH p.session s LEFT JOIN FETCH s.slot sl LEFT JOIN FETCH sl.floor f LEFT JOIN FETCH f.building b " +
           "WHERE (:buildingId IS NULL OR b.id = :buildingId)")
    List<Payment> findByBuildingId(@Param("buildingId") UUID buildingId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.session s LEFT JOIN FETCH s.slot sl LEFT JOIN FETCH sl.floor f LEFT JOIN FETCH f.building b " +
           "WHERE p.status = 'PAID' AND p.paidAt >= :startDate AND p.paidAt <= :endDate " +
           "AND (:buildingId IS NULL OR b.id = :buildingId)")
    List<Payment> findPaidPaymentsWithinPeriod(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("buildingId") UUID buildingId
    );
}
