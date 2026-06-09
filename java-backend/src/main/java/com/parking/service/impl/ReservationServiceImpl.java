package com.parking.service.impl;

import com.parking.dto.reservation.ReservationRequest;
import com.parking.dto.reservation.ReservationResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.User;
import com.parking.enums.ReservationStatus;
import com.parking.enums.UserRole;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.UserRepository;
import com.parking.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository slotRepository;
    private final UserRepository userRepository;
    private final ParkingBuildingRepository buildingRepository;

    @Override
    public ReservationResponse createReservation(ReservationRequest request, String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        ParkingBuilding building = buildingRepository.findByIdWithWriteLock(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        if (request.getReservedFrom().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reservation start time must be in the future.");
        }
        if (request.getReservedTo().isBefore(request.getReservedFrom())) {
            throw new BadRequestException("Reservation end time must be after the start time.");
        }

        if (request.getReservedFrom().isAfter(LocalDateTime.now().plusDays(7))) {
            throw new BadRequestException("Reservations can only be made up to 7 days in advance.");
        }

        if (java.time.Duration.between(request.getReservedFrom(), request.getReservedTo()).toMinutes() > 1440) {
            throw new BadRequestException("Reservations cannot exceed a duration of 24 hours.");
        }

        ParkingSlot slot = null;
        if (request.getSlotId() != null) {
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

            // Validate building match
            if (!slot.getFloor().getBuilding().getId().equals(building.getId())) {
                throw new BadRequestException("Slot does not belong to the selected building.");
            }

            // Validate vehicle type compatibility
            if (slot.getVehicleType() != request.getVehicleType()) {
                throw new BadRequestException("Vehicle type " + request.getVehicleType() + 
                        " is not compatible with slot type " + slot.getVehicleType());
            }

            // Check for conflicting reservations targeting this specific slot
            List<Reservation> activeReservations = reservationRepository.findBySlotIdAndStatusIn(
                    slot.getId(), List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
            );

            for (Reservation res : activeReservations) {
                if (request.getReservedFrom().isBefore(res.getReservedTo()) && 
                    request.getReservedTo().isAfter(res.getReservedFrom())) {
                    throw new BadRequestException("This slot is already reserved for the selected time window.");
                }
            }
        } else {
            // Flexible allocation: check building capacity for the vehicle type
            long totalCapacity = slotRepository.countByBuildingIdAndVehicleType(building.getId(), request.getVehicleType());
            if (totalCapacity == 0) {
                throw new BadRequestException("This building does not have any slots for vehicle type: " + request.getVehicleType());
            }

            List<Reservation> activeReservationsInBuilding = reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(
                    building.getId(), request.getVehicleType(), request.getReservedFrom(), request.getReservedTo()
            );

            if (activeReservationsInBuilding.size() >= totalCapacity) {
                throw new BadRequestException("No available capacity for vehicle type " + request.getVehicleType() + 
                        " in building " + building.getName() + " for the selected time window.");
            }
        }

        Reservation reservation = Reservation.builder()
                .driver(driver)
                .building(building)
                .slot(slot)
                .vehicleType(request.getVehicleType())
                .reservedFrom(request.getReservedFrom())
                .reservedTo(request.getReservedTo())
                .status(ReservationStatus.CONFIRMED)
                .build();

        reservation = reservationRepository.save(reservation);
        return mapToResponse(reservation);
    }

    @Override
    public ReservationResponse cancelReservation(UUID id, String currentUserEmail) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        // Only the driver who reserved or a manager can cancel
        if (!reservation.getDriver().getId().equals(user.getId()) && user.getRole() != UserRole.MANAGER) {
            throw new AccessDeniedException("You do not have permission to cancel this reservation.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.USED) {
            throw new BadRequestException("Reservation cannot be cancelled from its current state: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation = reservationRepository.save(reservation);
        return mapToResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        return reservationRepository.findByDriverId(driver.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByStatus(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return reservationRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        try {
            ReservationStatus status = ReservationStatus.valueOf(statusStr.toUpperCase());
            return reservationRepository.findByStatus(status).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid reservation status: " + statusStr);
        }
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .buildingId(reservation.getBuilding().getId())
                .vehicleType(reservation.getVehicleType())
                .reservedFrom(reservation.getReservedFrom())
                .reservedTo(reservation.getReservedTo())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .driverId(reservation.getDriver().getId())
                .driverName(reservation.getDriver().getFullName())
                .slotId(reservation.getSlot() != null ? reservation.getSlot().getId() : null)
                .slotCode(reservation.getSlot() != null ? reservation.getSlot().getSlotCode() : null)
                .buildingName(reservation.getBuilding().getName())
                .floorName(reservation.getSlot() != null ? reservation.getSlot().getFloor().getFloorName() : null)
                .build();
    }
}
