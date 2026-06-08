package com.parking.service;

import com.parking.dto.building.BuildingRequest;
import com.parking.dto.building.BuildingResponse;

import java.util.List;
import java.util.UUID;

public interface BuildingService {

    List<BuildingResponse> getAllBuildings();

    List<BuildingResponse> getActiveBuildings();

    BuildingResponse getBuildingById(UUID id);

    BuildingResponse createBuilding(BuildingRequest request);

    BuildingResponse updateBuilding(UUID id, BuildingRequest request);

    void toggleBuildingStatus(UUID id);
}
