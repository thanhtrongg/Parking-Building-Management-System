package com.parking.service.impl;

import com.parking.dto.zone.ZoneRequest;
import com.parking.dto.zone.ZoneResponse;
import com.parking.entity.Zone;
import com.parking.exception.ResourceNotFoundException;
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

    @InjectMocks
    private ZoneServiceImpl zoneService;

    private UUID zoneId;
    private UUID vehicleTypeId;

    @BeforeEach
    void setUp() {
        zoneId = UUID.randomUUID();
        vehicleTypeId = UUID.randomUUID();
    }

    @Test
    void testGetAllZones_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .build();

        when(zoneRepository.findAll()).thenReturn(List.of(zone));

        List<ZoneResponse> response = zoneService.getAllZones();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Zone A", response.get(0).getZoneName());
    }

    @Test
    void testGetZoneById_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));

        ZoneResponse response = zoneService.getZoneById(zoneId);

        assertNotNull(response);
        assertEquals("Zone A", response.getZoneName());
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
                .build();

        when(zoneRepository.save(any(Zone.class))).thenReturn(zone);

        ZoneRequest request = ZoneRequest.builder()
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .build();

        ZoneResponse response = zoneService.createZone(request);

        assertNotNull(response);
        assertEquals("Zone A", response.getZoneName());
    }

    @Test
    void testUpdateZone_Success() {
        Zone zone = Zone.builder()
                .id(zoneId)
                .zoneName("Zone A")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(10)
                .build();

        when(zoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(zoneRepository.save(any(Zone.class))).thenReturn(zone);

        ZoneRequest request = ZoneRequest.builder()
                .zoneName("Zone B")
                .vehicleTypeId(vehicleTypeId)
                .totalCapacity(20)
                .build();

        ZoneResponse response = zoneService.updateZone(zoneId, request);

        assertNotNull(response);
        assertEquals("Zone B", response.getZoneName());
    }

    @Test
    void testDeleteZone_Success() {
        when(zoneRepository.existsById(zoneId)).thenReturn(true);
        doNothing().when(zoneRepository).deleteById(zoneId);

        zoneService.deleteZone(zoneId);

        verify(zoneRepository, times(1)).deleteById(zoneId);
    }
}
