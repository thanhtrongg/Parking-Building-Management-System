package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.pricing.PricingRequest;
import com.parking.dto.pricing.PricingResponse;
import com.parking.service.PricingService;
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
@RequestMapping("/pricing")
@RequiredArgsConstructor
@Tag(name = "Pricing", description = "Pricing configuration management")
public class PricingController {

    private final PricingService pricingService;

    @Operation(summary = "Get pricing by building ID")
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<ApiResponse<List<PricingResponse>>> getPricingByBuilding(@PathVariable UUID buildingId) {
        List<PricingResponse> response = pricingService.getPricingByBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success("Pricing configuration retrieved successfully", response));
    }

    @Operation(summary = "Get pricing by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PricingResponse>> getPricingById(@PathVariable UUID id) {
        PricingResponse response = pricingService.getPricingById(id);
        return ResponseEntity.ok(ApiResponse.success("Pricing retrieved successfully", response));
    }

    @Operation(summary = "Create a new pricing configuration")
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PricingResponse>> createPricing(@Valid @RequestBody PricingRequest request) {
        PricingResponse response = pricingService.createPricing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pricing created successfully", response));
    }

    @Operation(summary = "Update a pricing configuration")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PricingResponse>> updatePricing(
            @PathVariable UUID id,
            @Valid @RequestBody PricingRequest request) {
        PricingResponse response = pricingService.updatePricing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Pricing updated successfully", response));
    }

    @Operation(summary = "Delete a pricing configuration")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePricing(@PathVariable UUID id) {
        pricingService.deletePricing(id);
        return ResponseEntity.ok(ApiResponse.success("Pricing deleted successfully", null));
    }
}
