package com.parking.service.impl;

import com.parking.dto.pricing.PricingRequest;
import com.parking.dto.pricing.PricingResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.Pricing;
import com.parking.entity.VehicleType;
import com.parking.exception.DuplicateResourceException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import com.parking.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PricingServiceImpl implements PricingService {

    private final PricingRepository pricingRepository;
    private final ParkingBuildingRepository buildingRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PricingResponse> getPricingByBuilding(UUID buildingId) {
        if (!buildingRepository.existsById(buildingId)) {
            throw new ResourceNotFoundException("Building not found with id: " + buildingId);
        }
        return pricingRepository.findByBuildingId(buildingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PricingResponse getPricingById(UUID id) {
        Pricing pricing = pricingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing not found with id: " + id));
        return mapToResponse(pricing);
    }

    @Override
    public PricingResponse createPricing(PricingRequest request) {
        ParkingBuilding building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        // Check if building already has pricing for this vehicle type
        if (pricingRepository.findByBuildingIdAndVehicleTypeId(request.getBuildingId(), request.getVehicleTypeId()).isPresent()) {
            throw new DuplicateResourceException("Pricing already exists for vehicle type " + vehicleType.getName() + " in this building.");
        }

        BigDecimal multiplier = request.getOvertimeFeeMultiplier() != null ? request.getOvertimeFeeMultiplier() : new BigDecimal("1.5");

        Pricing pricing = Pricing.builder()
                .building(building)
                .vehicleType(vehicleType)
                .hourlyRate(request.getHourlyRate())
                .dailyRate(request.getDailyRate())
                .lostTicketFee(request.getLostTicketFee())
                .overtimeFeeMultiplier(multiplier)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        pricing = pricingRepository.save(pricing);
        return mapToResponse(pricing);
    }

    @Override
    public PricingResponse updatePricing(UUID id, PricingRequest request) {
        Pricing pricing = pricingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing not found with id: " + id));

        ParkingBuilding building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        pricing.setBuilding(building);
        pricing.setVehicleType(vehicleType);
        pricing.setHourlyRate(request.getHourlyRate());
        pricing.setDailyRate(request.getDailyRate());
        pricing.setLostTicketFee(request.getLostTicketFee());
        pricing.setOvertimeFeeMultiplier(request.getOvertimeFeeMultiplier() != null ? request.getOvertimeFeeMultiplier() : new BigDecimal("1.5"));
        pricing.setEffectiveFrom(request.getEffectiveFrom());
        pricing.setEffectiveTo(request.getEffectiveTo());

        pricing = pricingRepository.save(pricing);
        return mapToResponse(pricing);
    }

    @Override
    public void deletePricing(UUID id) {
        if (!pricingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pricing not found with id: " + id);
        }
        pricingRepository.deleteById(id);
    }

    private PricingResponse mapToResponse(Pricing pricing) {
        return PricingResponse.builder()
                .id(pricing.getId())
                .hourlyRate(pricing.getHourlyRate())
                .dailyRate(pricing.getDailyRate())
                .lostTicketFee(pricing.getLostTicketFee())
                .overtimeFeeMultiplier(pricing.getOvertimeFeeMultiplier())
                .buildingId(pricing.getBuilding().getId())
                .buildingName(pricing.getBuilding().getName())
                .vehicleTypeId(pricing.getVehicleType().getId())
                .vehicleTypeName(pricing.getVehicleType().getName())
                .effectiveFrom(pricing.getEffectiveFrom())
                .effectiveTo(pricing.getEffectiveTo())
                .build();
    }
}
