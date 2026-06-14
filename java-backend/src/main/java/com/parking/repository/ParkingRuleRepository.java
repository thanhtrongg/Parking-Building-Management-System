package com.parking.repository;

import com.parking.entity.ParkingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingRuleRepository extends JpaRepository<ParkingRule, UUID> {
    List<ParkingRule> findByBuildingIdOrderByDisplayOrderAsc(UUID buildingId);
    List<ParkingRule> findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID buildingId);
}
