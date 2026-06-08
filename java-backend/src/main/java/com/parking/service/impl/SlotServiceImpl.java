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
        // Find floors in building with matching vehicle type
        List<Floor> floors = floorRepository.findByBuildingIdAndVehicleType(request.getBuildingId(), request.getVehicleType());
        if (floors.isEmpty()) {
            throw new BadRequestException("No floors found for the requested vehicle type in this building");
        }

        // Get all AVAILABLE slots on those floors
        List<ParkingSlot> availableSlots = floors.stream()
                .flatMap(f -> slotRepository.findByFloorIdAndStatus(f.getId(), SlotStatus.AVAILABLE).stream())
                .collect(Collectors.toList());

        if (availableSlots.isEmpty()) {
            throw new BadRequestException("No available slots found for this vehicle type in the building");
        }

        // Filter out slots that have overlapping reservations within the next 2 hours
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursFromNow = now.plusHours(2);

        List<UUID> slotIds = availableSlots.stream().map(ParkingSlot::getId).collect(Collectors.toList());
        List<Reservation> overlappingReservations = reservationRepository.findOverlappingReservations(slotIds, now, twoHoursFromNow);

        Set<UUID> reservedSlotIds = overlappingReservations.stream()
                .map(r -> r.getSlot().getId())
                .collect(Collectors.toSet());

        List<ParkingSlot> candidates = availableSlots.stream()
                .filter(s -> !reservedSlotIds.contains(s.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            throw new BadRequestException("All available slots have upcoming reservations in the next 2 hours");
        }

        // Score slots:
        // Proximity score = 1000 - (floorNumber * 100)
        // Sort by score descending (so highest score comes first), then by slotCode lexicographically.
        ParkingSlot bestSlot = candidates.stream()
                .min((s1, s2) -> {
                    int score1 = 1000 - (s1.getFloor().getFloorNumber() * 100);
                    int score2 = 1000 - (s2.getFloor().getFloorNumber() * 100);
                    if (score1 != score2) {
                        return Integer.compare(score2, score1); // descending order of score
                    }
                    return s1.getSlotCode().compareTo(s2.getSlotCode()); // ascending order of slot code
                })
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
