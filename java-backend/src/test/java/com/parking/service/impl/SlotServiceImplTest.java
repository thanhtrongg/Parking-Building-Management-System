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
import com.parking.dto.slot.SlotRequest;
import com.parking.entity.Zone;
import com.parking.entity.VehicleType;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.VehicleTypeRepository;
import com.parking.repository.ParkingSessionRepository;
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

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private VehicleTypeRepository vehicleTypeRepository;

    @Mock
    private ParkingSessionRepository parkingSessionRepository;

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
    void testGetAllSlots_Success() {
        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findAll()).thenReturn(List.of(slot));

        List<SlotResponse> response = slotService.getAllSlots(null);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("A1", response.get(0).getSlotCode());
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

        when(slotRepository.findAvailableSlotsByBuildingAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(List.of(slotF1, slotF2));
        when(reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(eq(buildingId), eq(VehicleTypeEnum.CAR), any(), any()))
                .thenReturn(Collections.emptyList());

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        SlotRecommendResponse response = slotService.recommendSlot(request);

        assertNotNull(response);
        // Should recommend Floor 1 slot because floor 1 has a lower floor number (1 < 2) hence higher score/closer.
        assertEquals("1F-01", response.getSlot().getSlotCode());
        assertTrue(response.getRecommendationReason().contains("Floor 1"));
    }

    @Test
    void testRecommendSlot_WithReservations() {
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        Floor floor1 = Floor.builder().id(floorId).floorName("Floor 1").floorNumber(1).building(building).build();

        ParkingSlot slotA = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1F-0A").status(SlotStatus.AVAILABLE).floor(floor1).build();
        ParkingSlot slotB = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1F-0B").status(SlotStatus.AVAILABLE).floor(floor1).build();

        when(slotRepository.findAvailableSlotsByBuildingAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(List.of(slotA, slotB));

        // Mock slotA being reserved
        Reservation reservation = Reservation.builder()
                .slot(slotA)
                .build();
        when(reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(eq(buildingId), eq(VehicleTypeEnum.CAR), any(), any()))
                .thenReturn(List.of(reservation));

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        SlotRecommendResponse response = slotService.recommendSlot(request);

        assertNotNull(response);
        // Should recommend slotB because slotA is reserved
        assertEquals("1F-0B", response.getSlot().getSlotCode());
    }

    @Test
    void testRecommendSlot_NoSlots_ThrowsBadRequestException() {
        when(slotRepository.findAvailableSlotsByBuildingAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(Collections.emptyList());

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        assertThrows(BadRequestException.class, () -> slotService.recommendSlot(request));
    }

    @Test
    void testCreateSlot_Success() {
        UUID zoneId = UUID.randomUUID();
        Zone zone = Zone.builder().id(zoneId).zoneName("Zone A").vehicleTypeId(UUID.randomUUID()).build();
        VehicleType vt = VehicleType.builder().name("CAR").build();
        Floor floor = Floor.builder().id(floorId).floorNumber(1).floorName("Floor 1").build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(vehicleTypeRepository.findById(zone.getVehicleTypeId())).thenReturn(Optional.of(vt));
        when(floorRepository.findAll()).thenReturn(List.of(floor));
        when(slotRepository.findAll()).thenReturn(Collections.emptyList());
        when(slotRepository.save(any(ParkingSlot.class))).thenAnswer(inv -> inv.getArgument(0));

        SlotRequest request = SlotRequest.builder()
                .slotCode("1A-01")
                .zoneId(zoneId.toString())
                .status(SlotStatus.AVAILABLE)
                .build();

        SlotResponse response = slotService.createSlot(request);

        assertNotNull(response);
        assertEquals("1A-01", response.getSlotCode());
        assertEquals("Zone A", response.getZone());
        assertEquals(VehicleTypeEnum.CAR, response.getVehicleType());
    }

    @Test
    void testCreateSlot_DuplicateCode_ThrowsBadRequestException() {
        UUID zoneId = UUID.randomUUID();
        Zone zone = Zone.builder().id(zoneId).zoneName("Zone A").vehicleTypeId(UUID.randomUUID()).build();
        VehicleType vt = VehicleType.builder().name("CAR").build();
        Floor floor = Floor.builder().id(floorId).floorNumber(1).floorName("Floor 1").build();
        ParkingSlot existingSlot = ParkingSlot.builder().id(UUID.randomUUID()).slotCode("1A-01").floor(floor).build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(vehicleTypeRepository.findById(zone.getVehicleTypeId())).thenReturn(Optional.of(vt));
        when(floorRepository.findAll()).thenReturn(List.of(floor));
        when(slotRepository.findAll()).thenReturn(List.of(existingSlot));

        SlotRequest request = SlotRequest.builder()
                .slotCode("1A-01")
                .zoneId(zoneId.toString())
                .status(SlotStatus.AVAILABLE)
                .build();

        assertThrows(BadRequestException.class, () -> slotService.createSlot(request));
    }

    @Test
    void testGetSlotById_Success() {
        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));

        SlotResponse response = slotService.getSlotById(slotId);

        assertNotNull(response);
        assertEquals("A1", response.getSlotCode());
    }

    @Test
    void testGetSlotById_NotFound_ThrowsResourceNotFoundException() {
        when(slotRepository.findById(slotId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> slotService.getSlotById(slotId));
    }

    @Test
    void testUpdateSlot_Success() {
        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").build();
        ParkingSlot slot = ParkingSlot.builder()
                .id(slotId)
                .slotCode("A1")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(ParkingSlot.class))).thenAnswer(inv -> inv.getArgument(0));

        SlotRequest request = SlotRequest.builder()
                .slotCode("A2")
                .status(SlotStatus.OCCUPIED)
                .build();

        SlotResponse response = slotService.updateSlot(slotId, request);

        assertNotNull(response);
        assertEquals("A2", response.getSlotCode());
        assertEquals(SlotStatus.OCCUPIED, response.getStatus());
    }

    @Test
    void testDeleteSlot_Success() {
        ParkingSlot slot = ParkingSlot.builder().id(slotId).build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(parkingSessionRepository.existsBySlotId(slotId)).thenReturn(false);
        when(reservationRepository.existsBySlotId(slotId)).thenReturn(false);

        assertDoesNotThrow(() -> slotService.deleteSlot(slotId));
        verify(slotRepository, times(1)).delete(slot);
    }

    @Test
    void testDeleteSlot_InUseBySession_ThrowsBadRequestException() {
        ParkingSlot slot = ParkingSlot.builder().id(slotId).build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(parkingSessionRepository.existsBySlotId(slotId)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> slotService.deleteSlot(slotId));
    }

    @Test
    void testDeleteSlot_InUseByReservation_ThrowsBadRequestException() {
        ParkingSlot slot = ParkingSlot.builder().id(slotId).build();

        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(parkingSessionRepository.existsBySlotId(slotId)).thenReturn(false);
        when(reservationRepository.existsBySlotId(slotId)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> slotService.deleteSlot(slotId));
    }

    @Test
    void testRecommendSlot_SmartAllocation() {
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        Floor floor = Floor.builder().id(floorId).floorName("Floor 1").floorNumber(1).building(building).build();

        // slotA: 20m to exit, zone "Zone A", named "1F-0B" (closer slot, should win under smart logic)
        ParkingSlot slotA = ParkingSlot.builder()
                .id(UUID.randomUUID())
                .slotCode("1F-0B")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .zone("Zone A")
                .distanceToExit(20)
                .build();

        // slotB: 50m to exit, zone "Zone A", named "1F-0A" (further slot, would win under old lexicographical logic)
        ParkingSlot slotB = ParkingSlot.builder()
                .id(UUID.randomUUID())
                .slotCode("1F-0A")
                .status(SlotStatus.AVAILABLE)
                .floor(floor)
                .zone("Zone A")
                .distanceToExit(50)
                .build();

        // mock repo calls
        when(slotRepository.findAvailableSlotsByBuildingAndVehicleType(buildingId, VehicleTypeEnum.CAR))
                .thenReturn(List.of(slotA, slotB));
        when(reservationRepository.findOverlappingReservationsByBuildingAndVehicleType(eq(buildingId), eq(VehicleTypeEnum.CAR), any(), any()))
                .thenReturn(Collections.emptyList());
        lenient().when(slotRepository.findByBuildingId(buildingId))
                .thenReturn(List.of(slotA, slotB));

        SlotRecommendRequest request = new SlotRecommendRequest(buildingId, VehicleTypeEnum.CAR);
        SlotRecommendResponse response = slotService.recommendSlot(request);

        assertNotNull(response);
        // Expect slotA because distanceToExit is smaller (20m < 50m) hence higher score
        assertEquals("1F-0B", response.getSlot().getSlotCode());
    }
}
