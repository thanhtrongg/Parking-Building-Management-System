package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.floor.FloorRequest;
import com.parking.dto.floor.FloorResponse;
import com.parking.service.FloorService;
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
@RequestMapping("/floors")
@RequiredArgsConstructor
@Tag(name = "Floor Management", description = "Endpoints for managing parking floors")
public class FloorController {

    private final FloorService floorService;

    @GetMapping("/building/{buildingId}")
    public ResponseEntity<ApiResponse<List<FloorResponse>>> getFloorsByBuilding(@PathVariable UUID buildingId) {
        List<FloorResponse> response = floorService.getFloorsByBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success("Floors retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FloorResponse>> getFloorById(@PathVariable UUID id) {
        FloorResponse response = floorService.getFloorById(id);
        return ResponseEntity.ok(ApiResponse.success("Floor retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<FloorResponse>> createFloor(@Valid @RequestBody FloorRequest request) {
        FloorResponse response = floorService.createFloor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Floor created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<FloorResponse>> updateFloor(
            @PathVariable UUID id,
            @Valid @RequestBody FloorRequest request) {
        FloorResponse response = floorService.updateFloor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Floor updated successfully", response));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> toggleFloorStatus(@PathVariable UUID id) {
        floorService.toggleFloorStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Floor status toggled successfully", null));
    }
}
