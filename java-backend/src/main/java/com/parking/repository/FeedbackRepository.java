package com.parking.repository;

import com.parking.entity.Feedback;
import com.parking.enums.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    Page<Feedback> findByDriverId(UUID driverId, Pageable pageable);

    @Query(value = "SELECT f FROM Feedback f " +
                   "LEFT JOIN FETCH f.driver d " +
                   "LEFT JOIN FETCH f.session s " +
                   "WHERE d.id = :driverId",
           countQuery = "SELECT COUNT(f) FROM Feedback f WHERE f.driver.id = :driverId")
    Page<Feedback> findByDriverIdWithFetch(@Param("driverId") UUID driverId, Pageable pageable);

    List<Feedback> findByStatus(FeedbackStatus status);
}
