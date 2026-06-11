package com.parking.service.impl;

import com.parking.dto.report.OccupancyReportResponse;
import com.parking.dto.report.PeakHoursReportResponse;
import com.parking.dto.report.RevenueReportResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.entity.*;
import com.parking.enums.SessionStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.PaymentRepository;
import com.parking.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository sessionRepository;
    private final FloorRepository floorRepository;

    @Override
    public RevenueReportResponse getRevenueReport(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId) {
        List<Payment> payments = paymentRepository.findPaidPaymentsWithinPeriod(startDate, endDate, buildingId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalBaseRevenue = BigDecimal.ZERO;
        BigDecimal totalExtraFeeRevenue = BigDecimal.ZERO;

        Map<VehicleTypeEnum, BigDecimal> vehicleTypeMap = new EnumMap<>(VehicleTypeEnum.class);
        Map<UUID, String> buildingNameMap = new HashMap<>();
        Map<UUID, BigDecimal> buildingRevenueMap = new HashMap<>();
        Map<LocalDate, BigDecimal> dailyRevenueMap = new TreeMap<>(); // sorted by date

        // Pre-populate all dates in range with zero revenue
        LocalDate startLocalDate = startDate.toLocalDate();
        LocalDate endLocalDate = endDate.toLocalDate();
        for (LocalDate date = startLocalDate; !date.isAfter(endLocalDate); date = date.plusDays(1)) {
            dailyRevenueMap.put(date, BigDecimal.ZERO);
        }

        for (Payment payment : payments) {
            BigDecimal base = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
            BigDecimal extra = payment.getExtraFee() != null ? payment.getExtraFee() : BigDecimal.ZERO;
            BigDecimal sum = base.add(extra);

            totalBaseRevenue = totalBaseRevenue.add(base);
            totalExtraFeeRevenue = totalExtraFeeRevenue.add(extra);
            totalRevenue = totalRevenue.add(sum);

            ParkingSession session = payment.getSession();
            if (session != null) {
                // Vehicle Type Breakdown
                VehicleTypeEnum vt = session.getVehicleType();
                if (vt != null) {
                    vehicleTypeMap.put(vt, vehicleTypeMap.getOrDefault(vt, BigDecimal.ZERO).add(sum));
                }

                // Building Breakdown
                ParkingSlot slot = session.getSlot();
                if (slot != null && slot.getFloor() != null && slot.getFloor().getBuilding() != null) {
                    ParkingBuilding building = slot.getFloor().getBuilding();
                    buildingNameMap.put(building.getId(), building.getName());
                    buildingRevenueMap.put(building.getId(), buildingRevenueMap.getOrDefault(building.getId(), BigDecimal.ZERO).add(sum));
                }
            }

            // Daily Breakdown
            if (payment.getPaidAt() != null) {
                LocalDate date = payment.getPaidAt().toLocalDate();
                dailyRevenueMap.put(date, dailyRevenueMap.getOrDefault(date, BigDecimal.ZERO).add(sum));
            }
        }

        List<RevenueReportResponse.VehicleTypeRevenue> vehicleTypeBreakdown = vehicleTypeMap.entrySet().stream()
                .map(e -> new RevenueReportResponse.VehicleTypeRevenue(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<RevenueReportResponse.BuildingRevenue> buildingBreakdown = buildingRevenueMap.entrySet().stream()
                .map(e -> new RevenueReportResponse.BuildingRevenue(e.getKey(), buildingNameMap.get(e.getKey()), e.getValue()))
                .collect(Collectors.toList());

        List<RevenueReportResponse.DailyRevenue> dailyBreakdown = dailyRevenueMap.entrySet().stream()
                .map(e -> new RevenueReportResponse.DailyRevenue(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBaseRevenue(totalBaseRevenue)
                .totalExtraFeeRevenue(totalExtraFeeRevenue)
                .vehicleTypeBreakdown(vehicleTypeBreakdown)
                .buildingBreakdown(buildingBreakdown)
                .dailyBreakdown(dailyBreakdown)
                .build();
    }

    @Override
    public OccupancyReportResponse getOccupancyReport(UUID buildingId) {
        List<Floor> floors = floorRepository.findFloorsWithSlots(buildingId);

        int totalSlots = 0;
        int occupiedSlots = 0;
        int availableSlots = 0;
        int reservedSlots = 0;
        int otherSlots = 0;

        List<OccupancyReportResponse.FloorOccupancy> floorBreakdown = new ArrayList<>();

        for (Floor floor : floors) {
            int fTotal = floor.getSlots().size();
            int fOccupied = 0;
            int fAvailable = 0;
            int fReserved = 0;
            int fOther = 0;

            for (ParkingSlot slot : floor.getSlots()) {
                switch (slot.getStatus()) {
                    case AVAILABLE:
                        fAvailable++;
                        break;
                    case OCCUPIED:
                        fOccupied++;
                        break;
                    case RESERVED:
                        fReserved++;
                        break;
                    case MAINTENANCE:
                    case LOCKED:
                    default:
                        fOther++;
                        break;
                }
            }

            totalSlots += fTotal;
            occupiedSlots += fOccupied;
            availableSlots += fAvailable;
            reservedSlots += fReserved;
            otherSlots += fOther;

            double fRate = fTotal > 0 ? (fOccupied * 100.0) / fTotal : 0.0;

            floorBreakdown.add(OccupancyReportResponse.FloorOccupancy.builder()
                    .floorId(floor.getId())
                    .floorName(floor.getFloorName())
                    .buildingName(floor.getBuilding() != null ? floor.getBuilding().getName() : "Unknown")
                    .totalSlots(fTotal)
                    .occupiedSlots(fOccupied)
                    .availableSlots(fAvailable)
                    .occupancyRate(fRate)
                    .build());
        }

        double totalRate = totalSlots > 0 ? (occupiedSlots * 100.0) / totalSlots : 0.0;

        return OccupancyReportResponse.builder()
                .totalSlots(totalSlots)
                .occupiedSlots(occupiedSlots)
                .availableSlots(availableSlots)
                .reservedSlots(reservedSlots)
                .otherSlots(otherSlots)
                .occupancyRate(totalRate)
                .floorBreakdown(floorBreakdown)
                .build();
    }

    @Override
    public PeakHoursReportResponse getPeakHoursReport(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId) {
        List<ParkingSession> sessions = sessionRepository.findSessionsWithinPeriod(startDate, endDate, buildingId);

        Map<Integer, Long> hourlyCounts = new HashMap<>();
        Map<DayOfWeek, Long> dailyCounts = new EnumMap<>(DayOfWeek.class);

        // Initialize maps
        for (int i = 0; i < 24; i++) {
            hourlyCounts.put(i, 0L);
        }
        for (DayOfWeek day : DayOfWeek.values()) {
            dailyCounts.put(day, 0L);
        }

        for (ParkingSession session : sessions) {
            if (session.getCheckInTime() != null) {
                int hour = session.getCheckInTime().getHour();
                hourlyCounts.put(hour, hourlyCounts.get(hour) + 1);

                DayOfWeek day = session.getCheckInTime().getDayOfWeek();
                dailyCounts.put(day, dailyCounts.get(day) + 1);
            }
        }

        List<PeakHoursReportResponse.HourlyArrival> hourlyArrivals = hourlyCounts.entrySet().stream()
                .map(e -> new PeakHoursReportResponse.HourlyArrival(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(PeakHoursReportResponse.HourlyArrival::getHour))
                .collect(Collectors.toList());

        List<PeakHoursReportResponse.DailyArrival> dailyArrivals = dailyCounts.entrySet().stream()
                .map(e -> new PeakHoursReportResponse.DailyArrival(e.getKey().name(), e.getValue()))
                .collect(Collectors.toList());

        return PeakHoursReportResponse.builder()
                .hourlyArrivals(hourlyArrivals)
                .dailyArrivals(dailyArrivals)
                .build();
    }

    @Override
    public Page<SessionResponse> searchSessions(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId,
                                                 SessionStatus status, String licensePlate, Pageable pageable) {
        Page<ParkingSession> sessionsPage = sessionRepository.searchSessions(startDate, endDate, buildingId, status, licensePlate, pageable);
        return sessionsPage.map(this::mapToResponse);
    }

    private SessionResponse mapToResponse(ParkingSession session) {
        Payment payment = paymentRepository.findBySessionId(session.getId()).stream()
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
                .build();
    }
}
