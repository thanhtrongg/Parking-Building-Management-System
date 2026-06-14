package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.rule.ParkingRuleRequest;
import com.parking.dto.rule.ParkingRuleResponse;
import com.parking.service.ParkingRuleService;
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
@RequestMapping("/rules")
@RequiredArgsConstructor
@Tag(name = "Parking Rules", description = "Parking rule management operations")
public class ParkingRuleController {

    private final ParkingRuleService parkingRuleService;

    @Operation(summary = "Get all rules for a building")
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<ApiResponse<List<ParkingRuleResponse>>> getRulesByBuilding(@PathVariable UUID buildingId) {
        List<ParkingRuleResponse> response = parkingRuleService.getRulesByBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success("Rules retrieved successfully", response));
    }

    @Operation(summary = "Get all active rules for a building")
    @GetMapping("/building/{buildingId}/active")
    public ResponseEntity<ApiResponse<List<ParkingRuleResponse>>> getActiveRulesByBuilding(@PathVariable UUID buildingId) {
        List<ParkingRuleResponse> response = parkingRuleService.getActiveRulesByBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success("Active rules retrieved successfully", response));
    }

    @Operation(summary = "Get a parking rule by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingRuleResponse>> getRuleById(@PathVariable UUID id) {
        ParkingRuleResponse response = parkingRuleService.getRuleById(id);
        return ResponseEntity.ok(ApiResponse.success("Rule retrieved successfully", response));
    }

    @Operation(summary = "Create a new parking rule")
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ParkingRuleResponse>> createRule(@Valid @RequestBody ParkingRuleRequest request) {
        ParkingRuleResponse response = parkingRuleService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule created successfully", response));
    }

    @Operation(summary = "Update an existing parking rule")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ParkingRuleResponse>> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody ParkingRuleRequest request) {
        ParkingRuleResponse response = parkingRuleService.updateRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rule updated successfully", response));
    }

    @Operation(summary = "Delete a parking rule")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        parkingRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted successfully", null));
    }
}
