package com.parking.service.impl;

import com.parking.dto.reservation.ReservationRequest;
import com.parking.dto.reservation.ReservationResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.User;
import com.parking.enums.ReservationStatus;
import com.parking.enums.UserRole;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.access.AccessDeniedException;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceImplTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParkingBuildingRepository buildingRepository;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private User driver;
    private ParkingBuilding building;
    private ParkingSlot slot;
    private String email = "driver@parking.com";

    @BeforeEach
    void setUp() {
        driver = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .fullName("Driver Test")
                .role(UserRole.DRIVER)
                .isActive(true)
                .build();

        building = ParkingBuilding.builder()
                .id(UUID.randomUUID())
                .name("Building A")
                .build();

        slot = ParkingSlot.builder()
                .id(UUID.randomUUID())
                .slotCode("A-101")
                .vehicleType(VehicleTypeEnum.CAR)
                .floor(com.parking.entity.Floor.builder().building(building).floorName("Floor 1").build())
                .build();
    }

    @Test
    void testCreateReservation_FlexibleSuccess() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        request.setReservedFrom(LocalDateTime.now().plusHours(1));
        request.setReservedTo(LocalDateTime.now().plusHours(2));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));
        when(slotRepository.countByBuildingIdAndVehicleType(building.getId(), VehicleTypeEnum.CAR)).thenReturn(10L);
        when(reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(
                eq(building.getId()), eq(VehicleTypeEnum.CAR), any(), any()
        )).thenReturn(Collections.emptyList());

        Reservation savedReservation = Reservation.builder()
                .id(UUID.randomUUID())
                .driver(driver)
                .building(building)
                .vehicleType(VehicleTypeEnum.CAR)
                .reservedFrom(request.getReservedFrom())
                .reservedTo(request.getReservedTo())
                .status(ReservationStatus.CONFIRMED)
                .build();
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        ReservationResponse response = reservationService.createReservation(request, email);

        assertNotNull(response);
        assertEquals(building.getId(), response.getBuildingId());
        assertNull(response.getSlotId());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void testCreateReservation_FlexibleFullCapacity() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        request.setReservedFrom(LocalDateTime.now().plusHours(1));
        request.setReservedTo(LocalDateTime.now().plusHours(2));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));
        when(slotRepository.countByBuildingIdAndVehicleType(building.getId(), VehicleTypeEnum.CAR)).thenReturn(2L);
        when(reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(
                eq(building.getId()), eq(VehicleTypeEnum.CAR), any(), any()
        )).thenReturn(List.of(new Reservation(), new Reservation()));

        assertThrows(BadRequestException.class, () -> reservationService.createReservation(request, email));
    }

    @Test
    void testCreateReservation_WithSpecificSlotSuccess() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        request.setSlotId(slot.getId());
        request.setReservedFrom(LocalDateTime.now().plusHours(1));
        request.setReservedTo(LocalDateTime.now().plusHours(2));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));
        when(slotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));
        when(reservationRepository.findBySlotIdAndStatusIn(eq(slot.getId()), anyList())).thenReturn(Collections.emptyList());

        Reservation savedReservation = Reservation.builder()
                .id(UUID.randomUUID())
                .driver(driver)
                .building(building)
                .slot(slot)
                .vehicleType(VehicleTypeEnum.CAR)
                .reservedFrom(request.getReservedFrom())
                .reservedTo(request.getReservedTo())
                .status(ReservationStatus.CONFIRMED)
                .build();
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        ReservationResponse response = reservationService.createReservation(request, email);

        assertNotNull(response);
        assertEquals(slot.getId(), response.getSlotId());
        assertEquals("A-101", response.getSlotCode());
    }

    @Test
    void testCancelReservation_Success() {
        UUID reservationId = UUID.randomUUID();
        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .driver(driver)
                .building(building)
                .status(ReservationStatus.CONFIRMED)
                .build();

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservationResponse response = reservationService.cancelReservation(reservationId, email);

        assertNotNull(response);
        assertEquals(ReservationStatus.CANCELLED, response.getStatus());
    }

    @Test
    void testCancelReservation_Forbidden() {
        UUID reservationId = UUID.randomUUID();
        User otherDriver = User.builder().id(UUID.randomUUID()).email("other@parking.com").role(UserRole.DRIVER).build();
        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .driver(driver)
                .building(building)
                .status(ReservationStatus.CONFIRMED)
                .build();

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(userRepository.findByEmail("other@parking.com")).thenReturn(Optional.of(otherDriver));

        assertThrows(AccessDeniedException.class, () -> reservationService.cancelReservation(reservationId, "other@parking.com"));
    }

    @Test
    void testGetMyReservations() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(reservationRepository.findByDriverId(driver.getId())).thenReturn(Collections.emptyList());

        List<ReservationResponse> responses = reservationService.getMyReservations(email);
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void testCreateReservation_MaxDurationLimitExceeded_ThrowsBadRequestException() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        // Start tomorrow, end 26 hours later
        request.setReservedFrom(LocalDateTime.now().plusDays(1));
        request.setReservedTo(LocalDateTime.now().plusDays(1).plusHours(26));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));

        assertThrows(BadRequestException.class, () ->
                reservationService.createReservation(request, email));
    }

    @Test
    void testCreateReservation_AdvanceBookingLimitExceeded_ThrowsBadRequestException() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        // Start 8 days in future, end 9 hours later
        request.setReservedFrom(LocalDateTime.now().plusDays(8));
        request.setReservedTo(LocalDateTime.now().plusDays(8).plusHours(2));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));

        assertThrows(BadRequestException.class, () ->
                reservationService.createReservation(request, email));
    }

    @Test
    void testCreateReservation_MaxDurationBoundaryLimitExceeded_ThrowsBadRequestException() {
        ReservationRequest request = new ReservationRequest();
        request.setBuildingId(building.getId());
        request.setVehicleType(VehicleTypeEnum.CAR);
        // Start tomorrow, end 24 hours + 5 minutes later
        request.setReservedFrom(LocalDateTime.now().plusDays(1));
        request.setReservedTo(LocalDateTime.now().plusDays(1).plusHours(24).plusMinutes(5));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(buildingRepository.findByIdWithWriteLock(building.getId())).thenReturn(Optional.of(building));

        assertThrows(BadRequestException.class, () ->
                reservationService.createReservation(request, email));
    }
}
