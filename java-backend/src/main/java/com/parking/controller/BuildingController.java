package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.building.BuildingRequest;
import com.parking.dto.building.BuildingResponse;
import com.parking.service.BuildingService;
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
@RequestMapping("/buildings")
@RequiredArgsConstructor
@Tag(name = "Building Management", description = "Endpoints for managing parking buildings")
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getAllBuildings() {
        List<BuildingResponse> response = buildingService.getAllBuildings();
        return ResponseEntity.ok(ApiResponse.success("Buildings retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getActiveBuildings() {
        List<BuildingResponse> response = buildingService.getActiveBuildings();
        return ResponseEntity.ok(ApiResponse.success("Active buildings retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BuildingResponse>> getBuildingById(@PathVariable UUID id) {
        BuildingResponse response = buildingService.getBuildingById(id);
        return ResponseEntity.ok(ApiResponse.success("Building retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<BuildingResponse>> createBuilding(@Valid @RequestBody BuildingRequest request) {
        BuildingResponse response = buildingService.createBuilding(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Building created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<BuildingResponse>> updateBuilding(
            @PathVariable UUID id, 
            @Valid @RequestBody BuildingRequest request) {
        BuildingResponse response = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(ApiResponse.success("Building updated successfully", response));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> toggleBuildingStatus(@PathVariable UUID id) {
        buildingService.toggleBuildingStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Building status toggled successfully", null));
    }
}
