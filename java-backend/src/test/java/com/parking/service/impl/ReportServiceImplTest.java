package com.parking.service.impl;

import com.parking.dto.report.OccupancyReportResponse;
import com.parking.dto.report.PeakHoursReportResponse;
import com.parking.dto.report.RevenueReportResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.entity.*;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private FloorRepository floorRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private UUID buildingId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @BeforeEach
    void setUp() {
        buildingId = UUID.randomUUID();
        startDate = LocalDateTime.now().minusDays(5);
        endDate = LocalDateTime.now();
    }

    @Test
    void testGetRevenueReport() {
        ParkingBuilding building = ParkingBuilding.builder()
                .id(buildingId)
                .name("Building A")
                .build();

        Floor floor = Floor.builder()
                .building(building)
                .build();

        ParkingSlot slot = ParkingSlot.builder()
                .floor(floor)
                .build();

        ParkingSession session1 = ParkingSession.builder()
                .vehicleType(VehicleTypeEnum.CAR)
                .slot(slot)
                .build();

        Payment payment1 = Payment.builder()
                .amount(new BigDecimal("50000"))
                .extraFee(new BigDecimal("10000"))
                .paidAt(LocalDateTime.now())
                .session(session1)
                .build();

        when(paymentRepository.findPaidPaymentsWithinPeriod(any(), any(), any()))
                .thenReturn(List.of(payment1));

        RevenueReportResponse report = reportService.getRevenueReport(startDate, endDate, buildingId);

        assertNotNull(report);
        assertEquals(0, report.getTotalRevenue().compareTo(new BigDecimal("60000")));
        assertEquals(0, report.getTotalBaseRevenue().compareTo(new BigDecimal("50000")));
        assertEquals(0, report.getTotalExtraFeeRevenue().compareTo(new BigDecimal("10000")));
        assertEquals(1, report.getVehicleTypeBreakdown().size());
        assertEquals(1, report.getBuildingBreakdown().size());
        assertEquals(1, report.getDailyBreakdown().size());
    }

    @Test
    void testGetOccupancyReport() {
        ParkingBuilding building = ParkingBuilding.builder()
                .id(buildingId)
                .name("Building A")
                .build();

        Floor floor1 = Floor.builder()
                .id(UUID.randomUUID())
                .floorName("Floor 1")
                .building(building)
                .slots(new ArrayList<>())
                .build();

        ParkingSlot slot1 = ParkingSlot.builder()
                .id(UUID.randomUUID())
                .status(SlotStatus.AVAILABLE)
                .floor(floor1)
                .build();

        ParkingSlot slot2 = ParkingSlot.builder()
                .id(UUID.randomUUID())
                .status(SlotStatus.OCCUPIED)
                .floor(floor1)
                .build();

        floor1.getSlots().add(slot1);
        floor1.getSlots().add(slot2);

        when(floorRepository.findFloorsWithSlots(buildingId))
                .thenReturn(List.of(floor1));

        OccupancyReportResponse report = reportService.getOccupancyReport(buildingId);

        assertNotNull(report);
        assertEquals(2, report.getTotalSlots());
        assertEquals(1, report.getOccupiedSlots());
        assertEquals(1, report.getAvailableSlots());
        assertEquals(50.0, report.getOccupancyRate());
        assertEquals(1, report.getFloorBreakdown().size());
        assertEquals(50.0, report.getFloorBreakdown().get(0).getOccupancyRate());
    }

    @Test
    void testGetPeakHoursReport() {
        ParkingSession s1 = ParkingSession.builder()
                .checkInTime(LocalDateTime.of(2026, 6, 8, 8, 30)) // Monday 8 AM
                .build();

        ParkingSession s2 = ParkingSession.builder()
                .checkInTime(LocalDateTime.of(2026, 6, 8, 17, 45)) // Monday 5 PM
                .build();

        when(sessionRepository.findSessionsWithinPeriod(any(), any(), any()))
                .thenReturn(List.of(s1, s2));

        PeakHoursReportResponse report = reportService.getPeakHoursReport(startDate, endDate, buildingId);

        assertNotNull(report);
        assertEquals(24, report.getHourlyArrivals().size());
        assertEquals(7, report.getDailyArrivals().size());

        // Monday is index 0 in DayOfWeek.values() standard enum mapping if we just dump by order,
        // DayOfWeek.values() gives MONDAY, TUESDAY, etc.
        // Let's verify counts
        long mondayCount = report.getDailyArrivals().stream()
                .filter(d -> d.getDayOfWeek().equals("MONDAY"))
                .mapToLong(PeakHoursReportResponse.DailyArrival::getCount)
                .findFirst()
                .orElse(0L);
        assertEquals(2L, mondayCount);

        long hour8Count = report.getHourlyArrivals().stream()
                .filter(h -> h.getHour() == 8)
                .mapToLong(PeakHoursReportResponse.HourlyArrival::getCount)
                .findFirst()
                .orElse(0L);
        assertEquals(1L, hour8Count);
    }

    @Test
    void testSearchSessions() {
        ParkingSession session = ParkingSession.builder()
                .id(UUID.randomUUID())
                .licensePlate("30A-12345")
                .ticketCode("TKT-123")
                .checkInTime(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();

        Page<ParkingSession> page = new PageImpl<>(List.of(session));
        Pageable pageable = PageRequest.of(0, 10);

        when(sessionRepository.searchSessions(any(), any(), any(), any(), any(), eq(pageable)))
                .thenReturn(page);

        Page<SessionResponse> result = reportService.searchSessions(startDate, endDate, buildingId, SessionStatus.ACTIVE, "30A", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("30A-12345", result.getContent().get(0).getLicensePlate());
    }
}
