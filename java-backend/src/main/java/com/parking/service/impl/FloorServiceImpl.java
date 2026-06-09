package com.parking.service.impl;

import com.parking.dto.floor.FloorRequest;
import com.parking.dto.floor.FloorResponse;
import com.parking.entity.Floor;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.service.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;
    private final ParkingBuildingRepository buildingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FloorResponse> getFloorsByBuilding(UUID buildingId) {
        if (!buildingRepository.existsById(buildingId)) {
            throw new ResourceNotFoundException("Building not found with id: " + buildingId);
        }
        return floorRepository.findByBuildingId(buildingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FloorResponse getFloorById(UUID id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));
        return mapToResponse(floor);
    }

    @Override
    public FloorResponse createFloor(FloorRequest request) {
        ParkingBuilding building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        Floor floor = Floor.builder()
                .building(building)
                .floorName(request.getFloorName())
                .floorNumber(request.getFloorNumber())
                .vehicleType(request.getVehicleType())
                .totalSlots(request.getTotalSlots())
                .isActive(true)
                .build();

        // Save floor first to get UUID
        floor = floorRepository.save(floor);

        List<ParkingSlot> slots = new ArrayList<>();
        for (int i = 1; i <= request.getTotalSlots(); i++) {
            String slotCode = String.format("%s-%03d", floor.getFloorName(), i);
            ParkingSlot slot = ParkingSlot.builder()
                    .floor(floor)
                    .slotCode(slotCode)
                    .status(SlotStatus.AVAILABLE)
                    .vehicleType(floor.getVehicleType())
                    .build();
            slots.add(slot);
        }
        floor.setSlots(slots);
        // Cascaded save will persist slots, or save them directly
        floor = floorRepository.save(floor);

        return mapToResponse(floor);
    }

    @Override
    public FloorResponse updateFloor(UUID id, FloorRequest request) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));

        ParkingBuilding building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        floor.setBuilding(building);
        floor.setFloorName(request.getFloorName());
        floor.setFloorNumber(request.getFloorNumber());

        // Handle total slots change
        if (floor.getTotalSlots() != request.getTotalSlots()) {
            int currentTotal = floor.getTotalSlots();
            int newTotal = request.getTotalSlots();

            if (newTotal > currentTotal) {
                // Add new slots
                for (int i = currentTotal + 1; i <= newTotal; i++) {
                    String slotCode = String.format("%s-%03d", floor.getFloorName(), i);
                    ParkingSlot slot = ParkingSlot.builder()
                            .floor(floor)
                            .slotCode(slotCode)
                            .status(SlotStatus.AVAILABLE)
                            .vehicleType(request.getVehicleType())
                            .build();
                    floor.getSlots().add(slot);
                }
            } else {
                // Remove excess slots if they are available
                // To keep it simple, we filter and delete slots starting from the end
                List<ParkingSlot> slots = floor.getSlots();
                int slotsToRemove = currentTotal - newTotal;
                int removedCount = 0;
                for (int i = slots.size() - 1; i >= 0 && removedCount < slotsToRemove; i--) {
                    ParkingSlot slot = slots.get(i);
                    if (slot.getStatus() == SlotStatus.AVAILABLE) {
                        slots.remove(i);
                        removedCount++;
                    }
                }
                if (removedCount < slotsToRemove) {
                    throw new com.parking.exception.BadRequestException(
                            String.format("Cannot reduce slot capacity from %d to %d. " +
                                    "Only %d slots could be removed because the remaining slots are occupied or reserved.",
                                    currentTotal, request.getTotalSlots(), removedCount));
                }
            }
            floor.setTotalSlots(floor.getSlots().size());
        }

        // Update slot vehicle types if floor vehicle type changes
        if (floor.getVehicleType() != request.getVehicleType()) {
            floor.setVehicleType(request.getVehicleType());
            if (floor.getSlots() != null) {
                for (ParkingSlot slot : floor.getSlots()) {
                    slot.setVehicleType(request.getVehicleType());
                }
            }
        }

        floor = floorRepository.save(floor);
        return mapToResponse(floor);
    }

    @Override
    public void toggleFloorStatus(UUID id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));
        floor.setActive(!floor.isActive());
        floorRepository.save(floor);
    }

    private FloorResponse mapToResponse(Floor floor) {
        int totalSlots = floor.getTotalSlots();
        int availableSlots = 0;
        int occupiedSlots = 0;

        if (floor.getSlots() != null) {
            for (ParkingSlot slot : floor.getSlots()) {
                if (slot.getStatus() == SlotStatus.AVAILABLE) {
                    availableSlots++;
                } else if (slot.getStatus() == SlotStatus.OCCUPIED) {
                    occupiedSlots++;
                }
            }
        }

        return FloorResponse.builder()
                .id(floor.getId())
                .buildingId(floor.getBuilding().getId())
                .buildingName(floor.getBuilding().getName())
                .floorName(floor.getFloorName())
                .floorNumber(floor.getFloorNumber())
                .vehicleType(floor.getVehicleType())
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .occupiedSlots(occupiedSlots)
                .active(floor.isActive())
                .build();
    }
}
