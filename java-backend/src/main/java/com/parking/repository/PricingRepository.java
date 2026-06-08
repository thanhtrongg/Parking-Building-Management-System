package com.parking.repository;

import com.parking.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, UUID> {

    List<Pricing> findByBuildingId(UUID buildingId);

    Optional<Pricing> findByBuildingIdAndVehicleTypeId(UUID buildingId, UUID vehicleTypeId);
}
