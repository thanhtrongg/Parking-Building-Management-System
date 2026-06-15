package com.parking.service;

import com.parking.dto.vehicletype.VehicleTypeRequest;
import com.parking.dto.vehicletype.VehicleTypeResponse;

import java.util.List;
import java.util.UUID;

public interface VehicleTypeService {

    List<VehicleTypeResponse> getAllVehicleTypes(UUID buildingId);

    VehicleTypeResponse getVehicleTypeById(UUID id);

    VehicleTypeResponse createVehicleType(VehicleTypeRequest request);

    VehicleTypeResponse updateVehicleType(UUID id, VehicleTypeRequest request);

    void deleteVehicleType(UUID id);
}
