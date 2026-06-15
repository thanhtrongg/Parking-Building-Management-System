package com.parking.service.impl;

import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotRequest;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.Zone;
import com.parking.entity.VehicleType;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.VehicleTypeRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SlotServiceImpl implements SlotService {

    private final ParkingSlotRepository slotRepository;
    private final FloorRepository floorRepository;
    private final ReservationRepository reservationRepository;
    private final ZoneRepository zoneRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByFloor(UUID floorId) {
        if (!floorRepository.existsById(floorId)) {
            throw new ResourceNotFoundException("Floor not found with id: " + floorId);
        }
        return slotRepository.findByFloorId(floorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlotsByFloor(UUID floorId) {
        if (!floorRepository.existsById(floorId)) {
            throw new ResourceNotFoundException("Floor not found with id: " + floorId);
        }
        return slotRepository.findByFloorIdAndStatus(floorId, SlotStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAllSlots(UUID buildingId) {
        List<ParkingSlot> slots = (buildingId != null)
                ? slotRepository.findByBuildingId(buildingId)
                : slotRepository.findAll();
        return slots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SlotResponse updateSlotStatus(UUID id, SlotStatusUpdateRequest request) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        slot.setStatus(request.getStatus());
        slot = slotRepository.save(slot);
        return mapToResponse(slot);
    }

    @Override
    @Transactional(readOnly = true)
    public SlotRecommendResponse recommendSlot(SlotRecommendRequest request) {
        // Fetch all available slots (with floor initialized) in a single query
        List<ParkingSlot> availableSlots = slotRepository.findAvailableSlotsByBuildingAndVehicleType(
                request.getBuildingId(), request.getVehicleType());

        if (availableSlots.isEmpty()) {
            throw new BadRequestException("No available slots found for this vehicle type in the building");
        }

        // Fetch overlapping reservations in a single query
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursFromNow = now.plusHours(2);
        List<Reservation> overlappingReservations = reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(
                request.getBuildingId(), request.getVehicleType(), now, twoHoursFromNow);

        Set<UUID> reservedSlotIds = overlappingReservations.stream()
                .map(Reservation::getSlot)
                .filter(java.util.Objects::nonNull)
                .map(ParkingSlot::getId)
                .collect(Collectors.toSet());

        List<ParkingSlot> candidates = availableSlots.stream()
                .filter(s -> !reservedSlotIds.contains(s.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            throw new BadRequestException("All available slots have upcoming reservations in the next 2 hours");
        }

        // Score slots:
        // Sort by proximity to ground floor (absolute value of floor number) ascending, then by slotCode lexicographically.
        java.util.Comparator<ParkingSlot> slotComparator = java.util.Comparator
                .comparing((ParkingSlot s) -> Math.abs(s.getFloor().getFloorNumber()))
                .thenComparing(ParkingSlot::getSlotCode);

        ParkingSlot bestSlot = candidates.stream()
                .min(slotComparator)
                .orElseThrow(() -> new BadRequestException("Failed to find a recommended slot"));

        String reason = String.format("Recommended slot %s on floor %s (floor number %d) because it is the closest floor with availability and has no upcoming reservations.",
                bestSlot.getSlotCode(), bestSlot.getFloor().getFloorName(), bestSlot.getFloor().getFloorNumber());

        return SlotRecommendResponse.builder()
                .slot(mapToResponse(bestSlot))
                .recommendationReason(reason)
                .build();
    }

    @Override
    public SlotResponse createSlot(SlotRequest request) {
        String zoneName = null;
        VehicleTypeEnum vehicleType = request.getVehicleType();

        if (request.getZoneId() != null && !request.getZoneId().isBlank()) {
            final UUID zoneUuid = UUID.fromString(request.getZoneId());
            Zone zone = zoneRepository.findById(zoneUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneUuid));
            zoneName = zone.getZoneName();
            if (vehicleType == null && zone.getVehicleTypeId() != null) {
                final UUID vehicleTypeUuid = zone.getVehicleTypeId();
                VehicleType vt = vehicleTypeRepository.findById(vehicleTypeUuid)
                        .orElseThrow(() -> new ResourceNotFoundException("VehicleType not found with id: " + vehicleTypeUuid));
                vehicleType = VehicleTypeEnum.valueOf(vt.getName().toUpperCase());
            }
        }

        if (vehicleType == null) {
            throw new BadRequestException("Vehicle type could not be resolved from request or zone");
        }

        final VehicleTypeEnum finalVehicleType = vehicleType;
        Floor tempFloor;
        if (request.getFloorId() != null) {
            final UUID floorUuid = request.getFloorId();
            tempFloor = floorRepository.findById(floorUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + floorUuid));
        } else {
            tempFloor = getFloorForVehicleType(finalVehicleType);
        }
        final Floor floor = tempFloor;

        // Check for duplicates
        final String newCode = request.getSlotCode().trim();
        if (slotRepository.findAll().stream().anyMatch(s -> s.getFloor().getId().equals(floor.getId()) 
                && s.getSlotCode().equalsIgnoreCase(newCode))) {
            throw new BadRequestException("Parking slot already exists on this floor with code: " + newCode);
        }

        ParkingSlot slot = ParkingSlot.builder()
                .slotCode(newCode)
                .status(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE)
                .vehicleType(finalVehicleType)
                .zone(zoneName)
                .floor(floor)
                .build();

        slot = slotRepository.save(slot);
        return mapToResponse(slot);
    }

    @Override
    @Transactional(readOnly = true)
    public SlotResponse getSlotById(UUID id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        return mapToResponse(slot);
    }

    @Override
    public SlotResponse updateSlot(UUID id, SlotRequest request) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        String zoneName = null;
        VehicleTypeEnum vehicleType = request.getVehicleType();

        if (request.getZoneId() != null && !request.getZoneId().isBlank()) {
            final UUID zoneUuid = UUID.fromString(request.getZoneId());
            Zone zone = zoneRepository.findById(zoneUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneUuid));
            zoneName = zone.getZoneName();
            if (vehicleType == null && zone.getVehicleTypeId() != null) {
                final UUID vehicleTypeUuid = zone.getVehicleTypeId();
                VehicleType vt = vehicleTypeRepository.findById(vehicleTypeUuid)
                        .orElseThrow(() -> new ResourceNotFoundException("VehicleType not found with id: " + vehicleTypeUuid));
                vehicleType = VehicleTypeEnum.valueOf(vt.getName().toUpperCase());
            }
        }

        if (vehicleType != null) {
            slot.setVehicleType(vehicleType);
        }

        if (zoneName != null) {
            slot.setZone(zoneName);
        }

        if (request.getFloorId() != null) {
            final UUID floorUuid = request.getFloorId();
            Floor floor = floorRepository.findById(floorUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + floorUuid));
            slot.setFloor(floor);
        } else if (vehicleType != null) {
            slot.setFloor(getFloorForVehicleType(vehicleType));
        }

        if (request.getSlotCode() != null && !request.getSlotCode().isBlank()) {
            final String newCode = request.getSlotCode().trim();
            // Check for duplicate on the same floor
            final UUID floorId = slot.getFloor().getId();
            if (slotRepository.findAll().stream().anyMatch(s -> !s.getId().equals(id)
                    && s.getFloor().getId().equals(floorId)
                    && s.getSlotCode().equalsIgnoreCase(newCode))) {
                throw new BadRequestException("Parking slot already exists on this floor with code: " + newCode);
            }
            slot.setSlotCode(newCode);
        }

        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }

        slot = slotRepository.save(slot);
        return mapToResponse(slot);
    }

    @Override
    public void deleteSlot(UUID id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        if (parkingSessionRepository.existsBySlotId(id)) {
            throw new BadRequestException("Cannot delete parking slot because it is used by parking sessions");
        }

        if (reservationRepository.existsBySlotId(id)) {
            throw new BadRequestException("Cannot delete parking slot because it is used by reservations");
        }

        slotRepository.delete(slot);
    }

    private Floor getFloorForVehicleType(VehicleTypeEnum vehicleType) {
        int floorNumber = 1;
        if (vehicleType == VehicleTypeEnum.MOTORBIKE) {
            floorNumber = 2;
        } else if (vehicleType == VehicleTypeEnum.BICYCLE) {
            floorNumber = 3;
        }
        final int targetNumber = floorNumber;
        return floorRepository.findAll().stream()
                .filter(f -> f.getFloorNumber() == targetNumber)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found for floor number " + targetNumber));
    }

    private SlotResponse mapToResponse(ParkingSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .floorId(slot.getFloor().getId())
                .floorName(slot.getFloor().getFloorName())
                .slotCode(slot.getSlotCode())
                .status(slot.getStatus())
                .vehicleType(slot.getVehicleType())
                .zone(slot.getZone())
                .buildingId(slot.getFloor().getBuilding() != null ? slot.getFloor().getBuilding().getId() : null)
                .build();
    }
}
