package com.parking.service.impl;

import com.parking.dto.reservation.ReservationRequest;
import com.parking.dto.reservation.ReservationResponse;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.User;
import com.parking.enums.ReservationStatus;
import com.parking.enums.UserRole;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.UserRepository;
import com.parking.service.ReservationService;
import lombok.RequiredArgsConstructor;
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

    @Override
    public ReservationResponse createReservation(ReservationRequest request, String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

        if (request.getReservedFrom().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reservation start time must be in the future.");
        }
        if (request.getReservedTo().isBefore(request.getReservedFrom())) {
            throw new BadRequestException("Reservation end time must be after the start time.");
        }

        // Validate vehicle type compatibility
        if (slot.getVehicleType() != request.getVehicleType()) {
            throw new BadRequestException("Vehicle type " + request.getVehicleType() + 
                    " is not compatible with slot type " + slot.getVehicleType());
        }

        // Check for conflicting reservations
        List<Reservation> activeReservations = reservationRepository.findBySlotIdAndStatusIn(
                slot.getId(), List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
        );

        for (Reservation res : activeReservations) {
            if (request.getReservedFrom().isBefore(res.getReservedTo()) && 
                request.getReservedTo().isAfter(res.getReservedFrom())) {
                throw new BadRequestException("This slot is already reserved for the selected time window.");
            }
        }

        Reservation reservation = Reservation.builder()
                .driver(driver)
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
            throw new BadRequestException("You do not have permission to cancel this reservation.");
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
                .vehicleType(reservation.getVehicleType())
                .reservedFrom(reservation.getReservedFrom())
                .reservedTo(reservation.getReservedTo())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .driverId(reservation.getDriver().getId())
                .driverName(reservation.getDriver().getFullName())
                .slotId(reservation.getSlot().getId())
                .slotCode(reservation.getSlot().getSlotCode())
                .buildingName(reservation.getSlot().getFloor().getBuilding().getName())
                .floorName(reservation.getSlot().getFloor().getFloorName())
                .build();
    }
}
