package com.parking.service.impl;

import com.parking.entity.Floor;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Pricing;
import com.parking.entity.VehicleType;
import com.parking.enums.VehicleTypeEnum;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.SessionResponse;
import com.parking.entity.User;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.lenient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ParkingSessionServiceImplTest {

    @Mock
    private VehicleTypeRepository vehicleTypeRepository;

    @Mock
    private PricingRepository pricingRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ParkingSessionServiceImpl sessionService;

    private ParkingSession session;
    private UUID buildingId;

    @BeforeEach
    void setUp() {
        buildingId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        Floor floor = Floor.builder().building(building).build();
        ParkingSlot slot = ParkingSlot.builder().floor(floor).build();

        session = ParkingSession.builder()
                .slot(slot)
                .vehicleType(VehicleTypeEnum.CAR)
                .build();

        VehicleType vehicleType = new VehicleType();
        vehicleType.setId(UUID.randomUUID());
        vehicleType.setName("CAR");

        lenient().when(vehicleTypeRepository.findByName("CAR")).thenReturn(Optional.of(vehicleType));
    }

    @Test
    @DisplayName("Calculate fee - Standard Day Rate (no night hours, base price applied)")
    void testCalculateFee_StandardDayRate() {
        // Set up pricing: hourly = 10k, base = 5k, no night rate (falls back to day)
        Pricing pricing = Pricing.builder()
                .hourlyRate(new BigDecimal("10000"))
                .basePrice(new BigDecimal("5000"))
                .dailyRate(new BigDecimal("100000"))
                .build();

        when(pricingRepository.findByBuildingIdAndVehicleTypeId(eq(buildingId), any())).thenReturn(Optional.of(pricing));

        // Stay from 8 AM to 12 PM (4 hours)
        LocalDateTime checkIn = LocalDateTime.of(2026, 6, 9, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 6, 9, 12, 0);
        session.setCheckInTime(checkIn);

        BigDecimal fee = sessionService.calculateFee(session, checkOut);

        // Expected: Base price (5k) + 4 hours * 10k = 45k VND
        assertEquals(0, fee.compareTo(new BigDecimal("45000")));
    }

    @Test
    @DisplayName("Calculate fee - Night Rate applied during night hours")
    void testCalculateFee_NightRate() {
        // Set up pricing: hourly = 10k, base = 0, night = 15k
        Pricing pricing = Pricing.builder()
                .hourlyRate(new BigDecimal("10000"))
                .basePrice(BigDecimal.ZERO)
                .nightRate(new BigDecimal("15000"))
                .dailyRate(new BigDecimal("200000"))
                .build();

        when(pricingRepository.findByBuildingIdAndVehicleTypeId(eq(buildingId), any())).thenReturn(Optional.of(pricing));

        // Stay from 11 PM to 3 AM (4 hours during night range: 22:00 to 06:00)
        LocalDateTime checkIn = LocalDateTime.of(2026, 6, 9, 23, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 6, 10, 3, 0);
        session.setCheckInTime(checkIn);

        BigDecimal fee = sessionService.calculateFee(session, checkOut);

        // Expected: 4 hours * 15k = 60k VND
        assertEquals(0, fee.compareTo(new BigDecimal("60000")));
    }

    @Test
    @DisplayName("Calculate fee - Spans across Day and Night rates")
    void testCalculateFee_SpansDayAndNight() {
        // Set up pricing: hourly = 10k, base = 5k, night = 15k
        Pricing pricing = Pricing.builder()
                .hourlyRate(new BigDecimal("10000"))
                .basePrice(new BigDecimal("5000"))
                .nightRate(new BigDecimal("15000"))
                .dailyRate(new BigDecimal("200000"))
                .build();

        when(pricingRepository.findByBuildingIdAndVehicleTypeId(eq(buildingId), any())).thenReturn(Optional.of(pricing));

        // Stay from 8 PM to 12 AM (4 hours: 8 PM - 10 PM is Day, 10 PM - 12 AM is Night)
        // 8 PM to 10 PM = 2 hours @ 10k = 20k
        // 10 PM to 12 AM = 2 hours @ 15k = 30k
        // Base = 5k
        // Total = 55k VND
        LocalDateTime checkIn = LocalDateTime.of(2026, 6, 9, 20, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 6, 10, 0, 0);
        session.setCheckInTime(checkIn);

        BigDecimal fee = sessionService.calculateFee(session, checkOut);

        assertEquals(0, fee.compareTo(new BigDecimal("55000")));
    }

    @Test
    @DisplayName("Calculate fee - Capped at daily rate under 24 hours")
    void testCalculateFee_CappedAtDailyRate() {
        // Set up pricing: hourly = 10k, base = 0, daily = 30k
        Pricing pricing = Pricing.builder()
                .hourlyRate(new BigDecimal("10000"))
                .basePrice(BigDecimal.ZERO)
                .dailyRate(new BigDecimal("30000"))
                .build();

        when(pricingRepository.findByBuildingIdAndVehicleTypeId(eq(buildingId), any())).thenReturn(Optional.of(pricing));

        // Stay from 8 AM to 4 PM (8 hours). Without cap: 80k. With cap: 30k.
        LocalDateTime checkIn = LocalDateTime.of(2026, 6, 9, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 6, 9, 16, 0);
        session.setCheckInTime(checkIn);

        BigDecimal fee = sessionService.calculateFee(session, checkOut);

        assertEquals(0, fee.compareTo(new BigDecimal("30000")));
    }

    @Test
    @DisplayName("Calculate fee - Spans multiple days with remaining hours capped")
    void testCalculateFee_MultiDayCapping() {
        // Set up pricing: hourly = 10k, base = 5k, daily = 50k
        Pricing pricing = Pricing.builder()
                .hourlyRate(new BigDecimal("10000"))
                .basePrice(new BigDecimal("5000"))
                .dailyRate(new BigDecimal("50000"))
                .build();

        when(pricingRepository.findByBuildingIdAndVehicleTypeId(eq(buildingId), any())).thenReturn(Optional.of(pricing));

        // Stay for 28 hours (1 day + 4 hours).
        // Base = 5k.
        // Day 1 = 50k.
        // Remaining 4 hours @ 10k = 40k.
        // Total = 5k + 50k + 40k = 95k VND.
        LocalDateTime checkIn = LocalDateTime.of(2026, 6, 9, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 6, 10, 12, 0);
        session.setCheckInTime(checkIn);

        BigDecimal fee = sessionService.calculateFee(session, checkOut);

        assertEquals(0, fee.compareTo(new BigDecimal("95000")));
    }

    @Test
    @DisplayName("Check-in success with optional null slot ID")
    void testCheckIn_OptionalNullSlot() {
        CheckInRequest request = new CheckInRequest();
        request.setLicensePlate("30A-99999");
        request.setVehicleType(VehicleTypeEnum.CAR);
        request.setGateIn("Gate A");

        User staff = User.builder().email("staff@parking.com").fullName("Staff In").build();
        lenient().when(userRepository.findByEmail("staff@parking.com")).thenReturn(Optional.of(staff));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = sessionService.checkIn(request, "staff@parking.com");

        assertNotNull(response);
        assertNull(response.getSlotId());
        assertEquals("30A-99999", response.getLicensePlate());
        assertEquals(SessionStatus.ACTIVE, response.getStatus());
    }

    @Test
    @DisplayName("Check-in success with valid slot ID")
    void testCheckIn_WithSlot() {
        UUID slotId = UUID.randomUUID();
        ParkingSlot slot = ParkingSlot.builder().id(slotId).status(SlotStatus.AVAILABLE).vehicleType(VehicleTypeEnum.CAR).build();
        
        CheckInRequest request = new CheckInRequest();
        request.setLicensePlate("30A-99999");
        request.setVehicleType(VehicleTypeEnum.CAR);
        request.setSlotId(slotId);
        request.setGateIn("Gate A");

        User staff = User.builder().email("staff@parking.com").fullName("Staff In").build();
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        lenient().when(userRepository.findByEmail("staff@parking.com")).thenReturn(Optional.of(staff));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = sessionService.checkIn(request, "staff@parking.com");

        assertNotNull(response);
        assertEquals(slotId, response.getSlotId());
        assertEquals(SlotStatus.OCCUPIED, slot.getStatus());
    }

    @Test
    @DisplayName("Assign slot to active session successfully")
    void testAssignSlot_Success() {
        UUID sessionId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        ParkingSession sessionEntity = ParkingSession.builder()
                .id(sessionId)
                .vehicleType(VehicleTypeEnum.CAR)
                .status(SessionStatus.ACTIVE)
                .build();
        ParkingSlot newSlot = ParkingSlot.builder()
                .id(slotId)
                .status(SlotStatus.AVAILABLE)
                .vehicleType(VehicleTypeEnum.CAR)
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(sessionEntity));
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(newSlot));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = sessionService.assignSlot(sessionId, slotId);

        assertNotNull(response);
        assertEquals(slotId, response.getSlotId());
        assertEquals(SlotStatus.OCCUPIED, newSlot.getStatus());
    }

    @Test
    @DisplayName("Assign slot releases previous slot")
    void testAssignSlot_ReleasesOldSlot() {
        UUID sessionId = UUID.randomUUID();
        UUID oldSlotId = UUID.randomUUID();
        UUID newSlotId = UUID.randomUUID();

        ParkingSlot oldSlot = ParkingSlot.builder().id(oldSlotId).status(SlotStatus.OCCUPIED).build();
        ParkingSession sessionEntity = ParkingSession.builder()
                .id(sessionId)
                .vehicleType(VehicleTypeEnum.CAR)
                .status(SessionStatus.ACTIVE)
                .slot(oldSlot)
                .build();
        ParkingSlot newSlot = ParkingSlot.builder()
                .id(newSlotId)
                .status(SlotStatus.AVAILABLE)
                .vehicleType(VehicleTypeEnum.CAR)
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(sessionEntity));
        when(slotRepository.findById(newSlotId)).thenReturn(Optional.of(newSlot));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = sessionService.assignSlot(sessionId, newSlotId);

        assertNotNull(response);
        assertEquals(newSlotId, response.getSlotId());
        assertEquals(SlotStatus.AVAILABLE, oldSlot.getStatus());
        assertEquals(SlotStatus.OCCUPIED, newSlot.getStatus());
    }

    @Test
    @DisplayName("Checkout throws exception if slot is null")
    void testCheckOut_ThrowsIfSlotNull() {
        UUID sessionId = UUID.randomUUID();
        ParkingSession sessionEntity = ParkingSession.builder()
                .id(sessionId)
                .status(SessionStatus.ACTIVE)
                .slot(null)
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(sessionEntity));

        assertThrows(BadRequestException.class, () ->
                sessionService.checkOut(sessionId, "Gate Out", "staff@parking.com"));
    }
}
