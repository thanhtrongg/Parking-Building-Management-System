package com.parking.service.impl;

import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.entity.Floor;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SlotServiceImplTest {

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private FloorRepository floorRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private SlotServiceImpl slotService;

    private UUID buildingId;
    private UUID floorId;
    private UUID slotId;

    @BeforeEach
    void setUp() {
        buildingId = UUID.randomUUID();
        floorId = UUID.randomUUID();
        slotId = UUID.randomUUID();
    }

    @Test
    void testGetSlotsByFloor_Success() {
        when(floorRepository.existsById(floorId)).thenReturn(true);

        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findByFloorId(floorId)).thenReturn(List.of(slot));

        List<SlotResponse> response = slotService.getSlotsByFloor(floorId);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("A1", response.get(0).getSlotCode());
    }

    @Test
    void testGetSlotsByFloor_NotFound_ThrowsResourceNotFoundException() {
        when(floorRepository.existsById(floorId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> slotService.getSlotsByFloor(floorId));
    }

    @Test
    void testGetAvailableSlotsByFloor_Success() {
        when(floorRepository.existsById(floorId)).thenReturn(true);

        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findByFloorIdAndStatus(floorId, SlotStatus.AVAILABLE)).thenReturn(List.of(slot));

        List<SlotResponse> response = slotService.getAvailableSlotsByFloor(floorId);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("A1", response.get(0).getSlotCode());
    }

    @Test
    void testUpdateSlotStatus_Success() {
        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(ParkingSlot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SlotStatusUpdateRequest request = new SlotStatusUpdateRequest();
        request.setStatus(SlotStatus.OCCUPIED);
        SlotResponse response = slotService.updateSlotStatus(slotId, request);

        assertNotNull(response);
        assertEquals(SlotStatus.OCCUPIED, response.getStatus());
    }

    @Test
    void testRecommendSlot_Success() {
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();

        Floor floor1 = Floor.builder().id(floorId).floorName("Floor 1").floorNumber(1).building(building).build();
        Floor floor2 = Floor.builder().id(UUID.randomUUID()).floorName("Floor 2").floorNumber(2).building(building).build();

        ParkingSlot slotF1 = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1F-01").status(SlotStatus.AVAILABLE).floor(floor1).build();
        ParkingSlot slotF2 = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("2F-01").status(SlotStatus.AVAILABLE).floor(floor2).build();

        when(floorRepository.findByBuildingIdAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(List.of(floor1, floor2));

        when(slotRepository.findByFloorIdAndStatus(floor1.getId(), SlotStatus.AVAILABLE)).thenReturn(List.of(slotF1));
        when(slotRepository.findByFloorIdAndStatus(floor2.getId(), SlotStatus.AVAILABLE)).thenReturn(List.of(slotF2));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(Collections.emptyList());

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        SlotRecommendResponse response = slotService.recommendSlot(request);

        assertNotNull(response);
        // Should recommend Floor 1 slot because floor 1 has a lower floor number (1 < 2) hence higher score.
        assertEquals("1F-01", response.getSlot().getSlotCode());
        assertTrue(response.getRecommendationReason().contains("Floor 1"));
    }

    @Test
    void testRecommendSlot_WithReservations() {
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        Floor floor1 = Floor.builder().id(floorId).floorName("Floor 1").floorNumber(1).building(building).build();

        ParkingSlot slotA = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1F-0A").status(SlotStatus.AVAILABLE).floor(floor1).build();
        ParkingSlot slotB = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1F-0B").status(SlotStatus.AVAILABLE).floor(floor1).build();

        when(floorRepository.findByBuildingIdAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(List.of(floor1));
        when(slotRepository.findByFloorIdAndStatus(floor1.getId(), SlotStatus.AVAILABLE))
                .thenReturn(List.of(slotA, slotB));

        // Mock slotA being reserved
        Reservation reservation = Reservation.builder()
                .slot(slotA)
                .build();
        when(reservationRepository.findOverlappingReservations(any(), any(), any()))
                .thenReturn(List.of(reservation));

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        SlotRecommendResponse response = slotService.recommendSlot(request);

        assertNotNull(response);
        // Should recommend slotB because slotA is reserved
        assertEquals("1F-0B", response.getSlot().getSlotCode());
    }

    @Test
    void testRecommendSlot_NoFloors_ThrowsBadRequestException() {
        when(floorRepository.findByBuildingIdAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(Collections.emptyList());

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        assertThrows(BadRequestException.class, () -> slotService.recommendSlot(request));
    }
}
