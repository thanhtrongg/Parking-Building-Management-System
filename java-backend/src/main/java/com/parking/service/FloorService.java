package com.parking.service;

import com.parking.dto.floor.FloorRequest;
import com.parking.dto.floor.FloorResponse;

import java.util.List;
import java.util.UUID;

public interface FloorService {

    List<FloorResponse> getFloorsByBuilding(UUID buildingId);

    FloorResponse getFloorById(UUID id);

    FloorResponse createFloor(FloorRequest request);

    FloorResponse updateFloor(UUID id, FloorRequest request);

    void toggleFloorStatus(UUID id);
}
