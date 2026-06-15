package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotRequest;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.service.SlotService;
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
@RequestMapping("/slots")
@RequiredArgsConstructor
@Tag(name = "Parking Slots", description = "Parking slot management and AI recommendations")
public class SlotController {

    private final SlotService slotService;

    @Operation(summary = "Get all slots")
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getAllSlots(
            @RequestParam(required = false) UUID buildingId) {
        List<SlotResponse> response = slotService.getAllSlots(buildingId);
        return ResponseEntity.ok(ApiResponse.success("All slots retrieved successfully", response));
    }

    @Operation(summary = "Get slots by floor ID")
    @GetMapping("/floor/{floorId}")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlotsByFloor(@PathVariable UUID floorId) {
        List<SlotResponse> response = slotService.getSlotsByFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", response));
    }

    @Operation(summary = "Get available slots by floor ID")
    @GetMapping("/floor/{floorId}/available")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getAvailableSlotsByFloor(@PathVariable UUID floorId) {
        List<SlotResponse> response = slotService.getAvailableSlotsByFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", response));
    }

    @Operation(summary = "Update slot status")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<SlotResponse>> updateSlotStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SlotStatusUpdateRequest request) {
        SlotResponse response = slotService.updateSlotStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Slot status updated successfully", response));
    }

    @Operation(summary = "Get AI-recommended parking slot")
    @PostMapping("/recommend")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<SlotRecommendResponse>> recommendSlot(
            @Valid @RequestBody SlotRecommendRequest request) {
        SlotRecommendResponse response = slotService.recommendSlot(request);
        return ResponseEntity.ok(ApiResponse.success("Recommended slot retrieved successfully", response));
    }

    @Operation(summary = "Create slot")
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SlotResponse>> createSlot(@Valid @RequestBody SlotRequest request) {
        SlotResponse response = slotService.createSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Slot created successfully", response));
    }

    @Operation(summary = "Get slot by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF', 'ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<SlotResponse>> getSlotById(@PathVariable UUID id) {
        SlotResponse response = slotService.getSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Slot retrieved successfully", response));
    }

    @Operation(summary = "Update slot")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SlotResponse>> updateSlot(@PathVariable UUID id, @Valid @RequestBody SlotRequest request) {
        SlotResponse response = slotService.updateSlot(id, request);
        return ResponseEntity.ok(ApiResponse.success("Slot updated successfully", response));
    }

    @Operation(summary = "Delete slot")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable UUID id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted successfully", null));
    }
}
