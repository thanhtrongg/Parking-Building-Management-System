package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.vehicletype.VehicleTypeRequest;
import com.parking.dto.vehicletype.VehicleTypeResponse;
import com.parking.service.VehicleTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vehicle-types")
@RequiredArgsConstructor
@Tag(name = "Vehicle Types", description = "Vehicle type catalog management")
public class VehicleTypeController {

    private final VehicleTypeService vehicleTypeService;

    @Operation(summary = "Get all vehicle types")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleTypeResponse>>> getAllVehicleTypes() {
        List<VehicleTypeResponse> response = vehicleTypeService.getAllVehicleTypes();
        return ResponseEntity.ok(ApiResponse.success("Vehicle types retrieved successfully", response));
    }

    @Operation(summary = "Get a vehicle type by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleTypeResponse>> getVehicleTypeById(@PathVariable UUID id) {
        VehicleTypeResponse response = vehicleTypeService.getVehicleTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type retrieved successfully", response));
    }

    @Operation(summary = "Create a new vehicle type")
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<VehicleTypeResponse>> createVehicleType(
            @Valid @RequestBody VehicleTypeRequest request) {
        VehicleTypeResponse response = vehicleTypeService.createVehicleType(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle type created successfully", response));
    }

    @Operation(summary = "Update a vehicle type")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<VehicleTypeResponse>> updateVehicleType(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleTypeRequest request) {
        VehicleTypeResponse response = vehicleTypeService.updateVehicleType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type updated successfully", response));
    }

    @Operation(summary = "Delete a vehicle type")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicleType(@PathVariable UUID id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type deleted successfully", null));
    }
}
