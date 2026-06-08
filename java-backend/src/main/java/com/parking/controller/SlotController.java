package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.service.SlotService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/slots")
@RequiredArgsConstructor
@Tag(name = "Parking Slot Management", description = "Endpoints for managing parking slots")
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlotsByFloor(@PathVariable UUID floorId) {
        List<SlotResponse> response = slotService.getSlotsByFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", response));
    }

    @GetMapping("/floor/{floorId}/available")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getAvailableSlotsByFloor(@PathVariable UUID floorId) {
        List<SlotResponse> response = slotService.getAvailableSlotsByFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<SlotResponse>> updateSlotStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SlotStatusUpdateRequest request) {
        SlotResponse response = slotService.updateSlotStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Slot status updated successfully", response));
    }

    @PostMapping("/recommend")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<SlotRecommendResponse>> recommendSlot(
            @Valid @RequestBody SlotRecommendRequest request) {
        SlotRecommendResponse response = slotService.recommendSlot(request);
        return ResponseEntity.ok(ApiResponse.success("Recommended slot retrieved successfully", response));
    }
}
