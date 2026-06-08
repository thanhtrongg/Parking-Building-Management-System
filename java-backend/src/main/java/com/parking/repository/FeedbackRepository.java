package com.parking.repository;

import com.parking.entity.Feedback;
import com.parking.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    List<Feedback> findByDriverId(UUID driverId);

    List<Feedback> findByStatus(FeedbackStatus status);
}
