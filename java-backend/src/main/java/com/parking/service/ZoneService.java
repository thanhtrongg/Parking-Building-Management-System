package com.parking.service;

import com.parking.dto.zone.ZoneRequest;
import com.parking.dto.zone.ZoneResponse;

import java.util.List;
import java.util.UUID;

public interface ZoneService {

    List<ZoneResponse> getAllZones();

    ZoneResponse getZoneById(UUID id);

    ZoneResponse createZone(ZoneRequest request);

    ZoneResponse updateZone(UUID id, ZoneRequest request);

    void deleteZone(UUID id);
}
