package com.parking.service.impl;

import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.CheckOutResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.entity.*;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import com.parking.service.ParkingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ParkingSessionServiceImpl implements ParkingSessionService {

    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final UserRepository userRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final PricingRepository pricingRepository;

    @Override
    public SessionResponse checkIn(CheckInRequest request, String currentUserEmail) {
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new BadRequestException("Parking slot is not available. Current status: " + slot.getStatus());
        }

        // Validate vehicle type compatibility
        if (slot.getVehicleType() != request.getVehicleType()) {
            throw new BadRequestException("Vehicle type " + request.getVehicleType() + 
                    " is not allowed in slot designed for " + slot.getVehicleType());
        }

        User staffIn = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found: " + currentUserEmail));

        User driver = null;
        if (request.getDriverId() != null) {
            driver = userRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getDriverId()));
        }

        // Mark slot as occupied
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        // Generate clean ticket code
        String ticketCode = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ParkingSession session = ParkingSession.builder()
                .licensePlate(request.getLicensePlate())
                .vehicleType(request.getVehicleType())
                .ticketCode(ticketCode)
                .checkInTime(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .gateIn(request.getGateIn())
                .slot(slot)
                .driver(driver)
                .staffIn(staffIn)
                .build();

        session = sessionRepository.save(session);
        return mapToResponse(session);
    }

    @Override
    public CheckOutResponse checkOut(UUID sessionId, String gateOut, String currentUserEmail) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Parking session is not active. Current status: " + session.getStatus());
        }

        User staffOut = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found: " + currentUserEmail));

        LocalDateTime checkOutTime = LocalDateTime.now();
        session.setCheckOutTime(checkOutTime);
        session.setStaffOut(staffOut);
        session.setGateOut(gateOut);
        // Note: Slot and Session status are not updated here yet; they are updated when payment is recorded

        BigDecimal amount = calculateFee(session, checkOutTime);

        return CheckOutResponse.builder()
                .sessionId(session.getId())
                .ticketCode(session.getTicketCode())
                .checkInTime(session.getCheckInTime())
                .checkOutTime(checkOutTime)
                .durationHours(calculateDurationHours(session.getCheckInTime(), checkOutTime))
                .amount(amount)
                .extraFee(BigDecimal.ZERO)
                .totalAmount(amount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions() {
        return sessionRepository.findByStatus(SessionStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getMySessions(String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));
        return sessionRepository.findByDriverId(driver.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CheckOutResponse lostTicket(UUID sessionId, String currentUserEmail) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Parking session is not active. Current status: " + session.getStatus());
        }

        User staffOut = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found: " + currentUserEmail));

        LocalDateTime checkOutTime = LocalDateTime.now();
        session.setCheckOutTime(checkOutTime);
        session.setStaffOut(staffOut);
        session.setStatus(SessionStatus.LOST_TICKET); // Temporarily tag as lost ticket

        BigDecimal baseAmount = calculateFee(session, checkOutTime);
        BigDecimal lostTicketFee = getLostTicketFee(session);

        return CheckOutResponse.builder()
                .sessionId(session.getId())
                .ticketCode(session.getTicketCode())
                .checkInTime(session.getCheckInTime())
                .checkOutTime(checkOutTime)
                .durationHours(calculateDurationHours(session.getCheckInTime(), checkOutTime))
                .amount(baseAmount)
                .extraFee(lostTicketFee)
                .totalAmount(baseAmount.add(lostTicketFee))
                .build();
    }

    private double calculateDurationHours(LocalDateTime start, LocalDateTime end) {
        long minutes = ChronoUnit.MINUTES.between(start, end);
        return Math.max(1.0, Math.ceil(minutes / 60.0));
    }

    BigDecimal calculateFee(ParkingSession session, LocalDateTime checkoutTime) {
        double durationHours = calculateDurationHours(session.getCheckInTime(), checkoutTime);
        UUID buildingId = session.getSlot().getFloor().getBuilding().getId();
        VehicleTypeEnum vehicleTypeEnum = session.getVehicleType();

        // Fallback defaults
        BigDecimal basePrice = BigDecimal.ZERO;
        BigDecimal hourlyRate = new BigDecimal("10000"); // 10k VND
        BigDecimal nightRate = null;
        BigDecimal dailyRate = new BigDecimal("100000"); // 100k VND

        VehicleType vehicleType = vehicleTypeRepository.findByName(vehicleTypeEnum.name()).orElse(null);
        if (vehicleType != null) {
            Pricing pricing = pricingRepository.findByBuildingIdAndVehicleTypeId(buildingId, vehicleType.getId()).orElse(null);
            if (pricing != null) {
                if (pricing.getBasePrice() != null) {
                    basePrice = pricing.getBasePrice();
                }
                hourlyRate = pricing.getHourlyRate();
                nightRate = pricing.getNightRate();
                dailyRate = pricing.getDailyRate();
            }
        }

        BigDecimal calculatedHourlyFee = BigDecimal.ZERO;
        if (dailyRate != null && durationHours >= 24) {
            long days = (long) (durationHours / 24);
            BigDecimal remAmount = calculateHourlyTotal(session.getCheckInTime().plusDays(days), checkoutTime, hourlyRate, nightRate);
            if (remAmount.compareTo(dailyRate) > 0) {
                remAmount = dailyRate;
            }
            calculatedHourlyFee = dailyRate.multiply(BigDecimal.valueOf(days)).add(remAmount);
        } else {
            calculatedHourlyFee = calculateHourlyTotal(session.getCheckInTime(), checkoutTime, hourlyRate, nightRate);
            if (dailyRate != null && calculatedHourlyFee.compareTo(dailyRate) > 0) {
                calculatedHourlyFee = dailyRate;
            }
        }

        return basePrice.add(calculatedHourlyFee);
    }

    private BigDecimal calculateHourlyTotal(LocalDateTime start, LocalDateTime end, BigDecimal dayRate, BigDecimal nightRate) {
        BigDecimal total = BigDecimal.ZERO;
        LocalDateTime current = start;
        while (current.isBefore(end)) {
            int hour = current.getHour();
            boolean isNight = (hour >= 22 || hour < 6); // 10 PM to 6 AM
            BigDecimal rate = (isNight && nightRate != null) ? nightRate : dayRate;
            total = total.add(rate);
            current = current.plusHours(1);
        }
        return total;
    }

    private BigDecimal getLostTicketFee(ParkingSession session) {
        UUID buildingId = session.getSlot().getFloor().getBuilding().getId();
        VehicleTypeEnum vehicleTypeEnum = session.getVehicleType();
        BigDecimal defaultLostFee = new BigDecimal("200000"); // Default 200k VND

        VehicleType vehicleType = vehicleTypeRepository.findByName(vehicleTypeEnum.name()).orElse(null);
        if (vehicleType != null) {
            Pricing pricing = pricingRepository.findByBuildingIdAndVehicleTypeId(buildingId, vehicleType.getId()).orElse(null);
            if (pricing != null && pricing.getLostTicketFee() != null) {
                return pricing.getLostTicketFee();
            }
        }
        return defaultLostFee;
    }

    private SessionResponse mapToResponse(ParkingSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .licensePlate(session.getLicensePlate())
                .vehicleType(session.getVehicleType())
                .ticketCode(session.getTicketCode())
                .checkInTime(session.getCheckInTime())
                .checkOutTime(session.getCheckOutTime())
                .status(session.getStatus())
                .gateIn(session.getGateIn())
                .gateOut(session.getGateOut())
                .slotId(session.getSlot() != null ? session.getSlot().getId() : null)
                .slotCode(session.getSlot() != null ? session.getSlot().getSlotCode() : null)
                .driverId(session.getDriver() != null ? session.getDriver().getId() : null)
                .driverName(session.getDriver() != null ? session.getDriver().getFullName() : null)
                .staffInId(session.getStaffIn() != null ? session.getStaffIn().getId() : null)
                .staffInName(session.getStaffIn() != null ? session.getStaffIn().getFullName() : null)
                .staffOutId(session.getStaffOut() != null ? session.getStaffOut().getId() : null)
                .staffOutName(session.getStaffOut() != null ? session.getStaffOut().getFullName() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateSessionFee(UUID sessionId, LocalDateTime checkoutTime) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));
        return calculateFee(session, checkoutTime);
    }
}
