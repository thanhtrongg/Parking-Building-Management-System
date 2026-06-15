package com.parking.service.impl;

import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.CheckOutResponse;
import com.parking.dto.session.GuestSessionResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.entity.*;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import com.parking.service.AuditService;
import com.parking.service.ParkingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final PaymentRepository paymentRepository;
    private final ParkingBuildingRepository buildingRepository;
    private final AuditService auditService;
    private final ReservationRepository reservationRepository;


    @Override
    public SessionResponse checkIn(CheckInRequest request, String currentUserEmail) {
        ParkingBuilding building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        boolean activeExists = sessionRepository.existsByLicensePlateAndStatusIn(
                request.getLicensePlate(), List.of(SessionStatus.ACTIVE, SessionStatus.LOST_TICKET)
        );
        if (activeExists) {
            throw new BadRequestException("Vehicle already has an active session.");
        }

        ParkingSlot slot = null;
        if (request.getSlotId() != null) {
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

            if (slot.getStatus() != SlotStatus.AVAILABLE) {
                throw new BadRequestException("Parking slot is not available. Current status: " + slot.getStatus());
            }

            // Validate vehicle type compatibility
            if (slot.getVehicleType() != request.getVehicleType()) {
                throw new BadRequestException("Vehicle type " + request.getVehicleType() + 
                        " is not allowed in slot designed for " + slot.getVehicleType());
            }

            // Validate slot's building
            if (slot.getFloor() == null || slot.getFloor().getBuilding() == null ||
                    !slot.getFloor().getBuilding().getId().equals(building.getId())) {
                throw new BadRequestException("Parking slot " + slot.getSlotCode() + " does not belong to building " + building.getName());
            }

            // Mark slot as occupied
            slot.setStatus(SlotStatus.OCCUPIED);
            slotRepository.save(slot);
        } else {
            // Auto-allocate optimal slot!
            List<ParkingSlot> availableSlots = slotRepository.findAvailableSlotsByBuildingAndVehicleType(
                    building.getId(), request.getVehicleType()
            );
            if (availableSlots.isEmpty()) {
                throw new BadRequestException("No available slots found for vehicle type " + request.getVehicleType() + " in building " + building.getName());
            }

            // Filter out slots that have upcoming reservations in the next 2 hours
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime twoHoursFromNow = now.plusHours(2);
            List<Reservation> overlappingReservations = reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(
                    building.getId(), request.getVehicleType(), now, twoHoursFromNow
            );

            java.util.Set<UUID> reservedSlotIds = overlappingReservations.stream()
                    .map(Reservation::getSlot)
                    .filter(java.util.Objects::nonNull)
                    .map(ParkingSlot::getId)
                    .collect(Collectors.toSet());

            List<ParkingSlot> candidates = availableSlots.stream()
                    .filter(s -> !reservedSlotIds.contains(s.getId()))
                    .collect(Collectors.toList());

            // If all available slots are reserved in the next 2 hours, fallback to any available slot
            if (candidates.isEmpty()) {
                candidates = availableSlots;
            }

            // Score candidates
            List<ParkingSlot> allSlots = slotRepository.findByBuildingId(building.getId());
            final java.util.Map<String, Long> zoneTotal = allSlots.stream()
                    .filter(s -> s.getZone() != null)
                    .collect(Collectors.groupingBy(ParkingSlot::getZone, Collectors.counting()));
            final java.util.Map<String, Long> zoneOccupied = allSlots.stream()
                    .filter(s -> s.getZone() != null && s.getStatus() == SlotStatus.OCCUPIED)
                    .collect(Collectors.groupingBy(ParkingSlot::getZone, Collectors.counting()));

            final double wDistance = 0.5;
            final double wFloor = 0.3;
            final double wUtilization = 0.2;

            java.util.function.Function<ParkingSlot, Double> scoreCalculator = (ParkingSlot s) -> {
                int distance = s.getDistanceToExit() != null ? s.getDistanceToExit() : 10;
                double distanceScore = Math.max(0.0, 1000.0 - distance);

                int floorNumber = s.getFloor() != null ? s.getFloor().getFloorNumber() : 1;
                double floorScore = 100.0 - (floorNumber * 10.0);

                double utilizationScore = 0.0;
                if (s.getZone() != null) {
                    long total = zoneTotal.getOrDefault(s.getZone(), 0L);
                    long occupied = zoneOccupied.getOrDefault(s.getZone(), 0L);
                    utilizationScore = total > 0 ? ((double) occupied / total) * 100.0 : 0.0;
                }

                return (wDistance * distanceScore) + (wFloor * floorScore) + (wUtilization * utilizationScore);
            };

            java.util.Comparator<ParkingSlot> slotComparator = (s1, s2) -> {
                double score1 = scoreCalculator.apply(s1);
                double score2 = scoreCalculator.apply(s2);
                int comp = Double.compare(score2, score1); // Descending order
                if (comp != 0) {
                    return comp;
                }
                return s1.getSlotCode().compareTo(s2.getSlotCode());
            };

            slot = candidates.stream()
                    .min(slotComparator)
                    .orElseThrow(() -> new BadRequestException("No available slot could be allocated."));

            // Mark slot as occupied
            slot.setStatus(SlotStatus.OCCUPIED);
            slotRepository.save(slot);
        }

        User staffIn = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found: " + currentUserEmail));

        User driver = null;
        if (request.getDriverId() != null) {
            driver = userRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getDriverId()));
        }

        // Generate clean ticket code
        String ticketCode = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LocalDateTime checkInTime = LocalDateTime.now();
        ParkingSession session = ParkingSession.builder()
                .building(building)
                .licensePlate(request.getLicensePlate())
                .vehicleType(request.getVehicleType())
                .ticketCode(ticketCode)
                .checkInTime(checkInTime)
                .status(SessionStatus.ACTIVE)
                .gateIn(request.getGateIn())
                .slot(slot)
                .parkedAt(slot != null ? checkInTime : null)
                .driver(driver)
                .staffIn(staffIn)
                .build();

        session = sessionRepository.save(session);
        auditService.log(currentUserEmail, "CHECK_IN", "ParkingSession", session.getId(),
                "License: " + session.getLicensePlate() + ", Gate: " + session.getGateIn() + ", Building: " + building.getName());
        return mapToResponse(session);
    }

    @Override
    public CheckOutResponse checkOut(UUID sessionId, String gateOut, String currentUserEmail) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Parking session is not active. Current status: " + session.getStatus());
        }

        if (session.getSlot() == null) {
            throw new BadRequestException("Parking slot must be assigned to the session before checkout.");
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
    public List<SessionResponse> getActiveSessions(UUID buildingId) {
        List<ParkingSession> sessions = (buildingId != null) 
                ? sessionRepository.findByBuildingIdAndStatus(buildingId, SessionStatus.ACTIVE)
                : sessionRepository.findByStatus(SessionStatus.ACTIVE);
        return sessions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SessionResponse> getMySessions(String currentUserEmail, UUID buildingId, Pageable pageable) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));
        
        Page<ParkingSession> sessionsPage = (buildingId != null)
                ? sessionRepository.findByDriverIdWithFetchAndBuilding(driver.getId(), buildingId, pageable)
                : sessionRepository.findByDriverIdWithFetch(driver.getId(), pageable);
                
        return sessionsPage.map(this::mapToResponse);
    }

    @Override
    public CheckOutResponse lostTicket(UUID sessionId, String currentUserEmail) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Parking session is not active. Current status: " + session.getStatus());
        }

        if (session.getSlot() == null) {
            throw new BadRequestException("Parking slot must be assigned to the session before checkout.");
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
        if (session.getCheckInTime() == null || checkoutTime == null ||
            session.getSlot() == null || session.getSlot().getFloor() == null ||
            session.getSlot().getFloor().getBuilding() == null) {
            return BigDecimal.ZERO;
        }
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
        UUID buildingId = session.getBuilding() != null ? session.getBuilding().getId() : 
                (session.getSlot() != null && session.getSlot().getFloor() != null && session.getSlot().getFloor().getBuilding() != null
                ? session.getSlot().getFloor().getBuilding().getId() : null);
        VehicleTypeEnum vehicleTypeEnum = session.getVehicleType();
        BigDecimal defaultLostFee = new BigDecimal("200000"); // Default 200k VND

        if (buildingId == null) {
            return defaultLostFee;
        }

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
        com.parking.entity.Payment payment = paymentRepository.findBySessionId(session.getId()).stream()
                .filter(p -> p.getStatus() == com.parking.enums.PaymentStatus.PAID || p.getStatus() == com.parking.enums.PaymentStatus.REFUNDED)
                .findFirst()
                .orElse(null);
        if (payment == null) {
            payment = paymentRepository.findBySessionId(session.getId()).stream().findFirst().orElse(null);
        }

        com.parking.dto.payment.PaymentResponse paymentRes = null;
        if (payment != null) {
            paymentRes = com.parking.dto.payment.PaymentResponse.builder()
                    .id(payment.getId())
                    .sessionId(session.getId())
                    .amount(payment.getAmount())
                    .extraFee(payment.getExtraFee())
                    .method(payment.getMethod())
                    .status(payment.getStatus())
                    .paidAt(payment.getPaidAt())
                    .build();
        }

        BigDecimal totalFee = BigDecimal.ZERO;
        if (paymentRes != null) {
            totalFee = paymentRes.getAmount().add(paymentRes.getExtraFee() != null ? paymentRes.getExtraFee() : BigDecimal.ZERO);
        } else if (session.getSlot() != null) {
            LocalDateTime endTime = session.getCheckOutTime() != null ? session.getCheckOutTime() : LocalDateTime.now();
            totalFee = calculateFee(session, endTime);
        }

        return SessionResponse.builder()
                .id(session.getId())
                .licensePlate(session.getLicensePlate())
                .vehicleType(session.getVehicleType())
                .ticketCode(session.getTicketCode())
                .checkInTime(session.getCheckInTime())
                .checkOutTime(session.getCheckOutTime())
                .parkedAt(session.getParkedAt())
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
                .totalFee(totalFee)
                .payment(paymentRes)
                .buildingId(session.getBuilding() != null ? session.getBuilding().getId() : null)
                .buildingName(session.getBuilding() != null ? session.getBuilding().getName() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateSessionFee(UUID sessionId, LocalDateTime checkoutTime) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));
        if (session.getSlot() == null) {
            throw new BadRequestException("Parking slot must be assigned to the session before checkout.");
        }
        BigDecimal fee = calculateFee(session, checkoutTime);
        if (session.getStatus() == SessionStatus.LOST_TICKET) {
            fee = fee.add(getLostTicketFee(session));
        }
        return fee;
    }

    @Override
    public SessionResponse assignSlot(UUID sessionId, UUID slotId, String currentUserEmail) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        if (currentUser.getRole() == com.parking.enums.UserRole.DRIVER) {
            if (session.getDriver() == null || !session.getDriver().getEmail().equalsIgnoreCase(currentUserEmail)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to modify this session.");
            }
        }

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign slot to an inactive parking session.");
        }

        ParkingSlot newSlot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + slotId));

        // If it's already the assigned slot, just return
        if (session.getSlot() != null && session.getSlot().getId().equals(slotId)) {
            return mapToResponse(session);
        }

        // Validate compatibility
        if (newSlot.getVehicleType() != session.getVehicleType()) {
            throw new BadRequestException("Vehicle type " + session.getVehicleType() + 
                    " is not allowed in slot designed for " + newSlot.getVehicleType());
        }

        // Validate availability
        if (newSlot.getStatus() != SlotStatus.AVAILABLE) {
            throw new BadRequestException("Parking slot is not available. Current status: " + newSlot.getStatus());
        }

        // Free the old slot if any
        if (session.getSlot() != null) {
            ParkingSlot oldSlot = session.getSlot();
            oldSlot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(oldSlot);
        }

        // Occupy the new slot
        newSlot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(newSlot);

        session.setSlot(newSlot);
        session.setParkedAt(LocalDateTime.now());
        ParkingSession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestSessionResponse lookupGuestSession(String ticketCode, String licensePlate) {
        if ((ticketCode == null || ticketCode.isBlank()) && (licensePlate == null || licensePlate.isBlank())) {
            throw new BadRequestException("Either ticketCode or licensePlate must be provided.");
        }

        ParkingSession session;

        if (ticketCode != null && !ticketCode.isBlank()) {
            session = sessionRepository.findByTicketCode(ticketCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with ticket code: " + ticketCode));
        } else {
            session = sessionRepository.findFirstByLicensePlateAndStatusInOrderByCheckInTimeDesc(
                    licensePlate, List.of(SessionStatus.ACTIVE, SessionStatus.LOST_TICKET)
            ).orElseThrow(() -> new ResourceNotFoundException("No active parking session found for license plate: " + licensePlate));
        }

        if (session.getStatus() != SessionStatus.ACTIVE && session.getStatus() != SessionStatus.LOST_TICKET) {
            throw new ResourceNotFoundException("Parking session is not active or lost ticket.");
        }

        BigDecimal accumulatedFee = calculateSessionFee(session.getId(), LocalDateTime.now());

        return GuestSessionResponse.builder()
                .session(mapToResponse(session))
                .accumulatedFee(accumulatedFee)
                .build();
    }
}
