package com.parking.service.impl;

import com.parking.dto.zone.ZoneRequest;
import com.parking.dto.zone.ZoneResponse;
import com.parking.entity.Zone;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ZoneRepository;
import com.parking.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ZoneResponse> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ZoneResponse getZoneById(UUID id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        return mapToResponse(zone);
    }

    @Override
    public ZoneResponse createZone(ZoneRequest request) {
        Zone zone = Zone.builder()
                .zoneName(request.getZoneName())
                .vehicleTypeId(request.getVehicleTypeId())
                .totalCapacity(request.getTotalCapacity())
                .build();
        zone = zoneRepository.save(zone);
        return mapToResponse(zone);
    }

    @Override
    public ZoneResponse updateZone(UUID id, ZoneRequest request) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));

        zone.setZoneName(request.getZoneName());
        zone.setVehicleTypeId(request.getVehicleTypeId());
        zone.setTotalCapacity(request.getTotalCapacity());

        zone = zoneRepository.save(zone);
        return mapToResponse(zone);
    }

    @Override
    public void deleteZone(UUID id) {
        if (!zoneRepository.existsById(id)) {
            throw new ResourceNotFoundException("Zone not found with id: " + id);
        }
        zoneRepository.deleteById(id);
    }

    private ZoneResponse mapToResponse(Zone zone) {
        return ZoneResponse.builder()
                .id(zone.getId())
                .zoneName(zone.getZoneName())
                .vehicleTypeId(zone.getVehicleTypeId())
                .totalCapacity(zone.getTotalCapacity())
                .build();
    }
}
