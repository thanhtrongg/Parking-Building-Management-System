package com.parking.service.impl;

import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
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

    private SlotResponse mapToResponse(ParkingSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .floorId(slot.getFloor().getId())
                .floorName(slot.getFloor().getFloorName())
                .slotCode(slot.getSlotCode())
                .status(slot.getStatus())
                .vehicleType(slot.getVehicleType())
                .build();
    }
}
