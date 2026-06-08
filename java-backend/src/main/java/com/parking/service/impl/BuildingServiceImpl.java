package com.parking.service.impl;

import com.parking.dto.building.BuildingRequest;
import com.parking.dto.building.BuildingResponse;
import com.parking.entity.Floor;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BuildingServiceImpl implements BuildingService {

    private final ParkingBuildingRepository buildingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getActiveBuildings() {
        return buildingRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BuildingResponse getBuildingById(UUID id) {
        ParkingBuilding building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
        return mapToResponse(building);
    }

    @Override
    public BuildingResponse createBuilding(BuildingRequest request) {
        ParkingBuilding building = ParkingBuilding.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .isActive(true)
                .build();

        building = buildingRepository.save(building);
        return mapToResponse(building);
    }

    @Override
    public BuildingResponse updateBuilding(UUID id, BuildingRequest request) {
        ParkingBuilding building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));

        building.setName(request.getName());
        building.setAddress(request.getAddress());
        building.setPhone(request.getPhone());
        building.setOpeningTime(request.getOpeningTime());
        building.setClosingTime(request.getClosingTime());

        building = buildingRepository.save(building);
        return mapToResponse(building);
    }

    @Override
    public void toggleBuildingStatus(UUID id) {
        ParkingBuilding building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
        building.setActive(!building.isActive());
        buildingRepository.save(building);
    }

    private BuildingResponse mapToResponse(ParkingBuilding building) {
        int totalFloors = building.getFloors() != null ? building.getFloors().size() : 0;
        int totalSlots = 0;
        int availableSlots = 0;

        if (building.getFloors() != null) {
            for (Floor floor : building.getFloors()) {
                if (floor.getSlots() != null) {
                    totalSlots += floor.getSlots().size();
                    for (ParkingSlot slot : floor.getSlots()) {
                        if (slot.getStatus() == SlotStatus.AVAILABLE) {
                            availableSlots++;
                        }
                    }
                }
            }
        }

        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .phone(building.getPhone())
                .openingTime(building.getOpeningTime())
                .closingTime(building.getClosingTime())
                .active(building.isActive())
                .totalFloors(totalFloors)
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .createdAt(building.getCreatedAt())
                .build();
    }
}
