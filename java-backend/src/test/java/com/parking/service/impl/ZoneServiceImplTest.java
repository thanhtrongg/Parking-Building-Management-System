package com.parking.service.impl;

import com.parking.dto.zone.ZoneRequest;
import com.parking.dto.zone.ZoneResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.Zone;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ZoneServiceImplTest {

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private ParkingBuildingRepository buildingRepository;

    @InjectMocks
    private ZoneServiceImpl zoneService;

    private UUID zoneId;
    private UUID vehicleTypeId;
    private UUID buildingId;
    private ParkingBuilding building;

    @BeforeEach
    void setUp() {
        zoneId = UUID.randomUUID();
        vehicleTypeId = UUID.randomUUID();
        buildingId = UUID.randomUUID();
        building = ParkingBuilding.builder().id(buildingId).name("Building A").build();

        lenient().when(buildingRepository.findById(buildingId)).thenReturn(Optional.of(building));
    }

    @Test
    void testGetAllZones_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .building(building)
                .build();

        when(zoneRepository.findAll()).thenReturn(List.of(zone));

        List<ZoneResponse> response = zoneService.getAllZones();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Zone A", response.get(0).getZoneName());
        assertEquals(buildingId, response.get(0).getBuildingId());
    }

    @Test
    void testGetZoneById_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .building(building)
                .build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));

        ZoneResponse response = zoneService.getZoneById(zoneId);

        assertNotNull(response);
        assertEquals("Zone A", response.getZoneName());
        assertEquals(buildingId, response.getBuildingId());
    }

    @Test
    void testGetZoneById_NotFound_ThrowsException() {
        when(zoneRepository.findById(zoneId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> zoneService.getZoneById(zoneId));
    }

    @Test
    void testCreateZone_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .building(building)
                .build();

        when(zoneRepository.save(any(Zone.class))).thenReturn(zone);

        ZoneRequest request = ZoneRequest.builder()
                .buildingId(buildingId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .build();

        ZoneResponse response = zoneService.createZone(request);

        assertNotNull(response);
        assertEquals("Zone A", response.getZoneName());
        assertEquals(buildingId, response.getBuildingId());
    }

    @Test
    void testUpdateZone_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .building(building)
                .build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(zoneRepository.save(any(Zone.class))).thenReturn(zone);

        ZoneRequest request = ZoneRequest.builder()
                .buildingId(buildingId)
                .zoneName("Zone B")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(20)
                .build();

        ZoneResponse response = zoneService.updateZone(zoneId, request);

        assertNotNull(response);
        assertEquals("Zone B", response.getZoneName());
        assertEquals(buildingId, response.getBuildingId());
    }

    @Test
    void testDeleteZone_Success() {
        when(zoneRepository.existsById(zoneId)).thenReturn(true);
        doNothing().when(zoneRepository).deleteById(zoneId);

        zoneService.deleteZone(zoneId);

        verify(zoneRepository, times(1)).deleteById(zoneId);
    }
}
