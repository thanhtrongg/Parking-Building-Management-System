package com.parking.dto.zone;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneRequest {

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    @NotBlank(message = "Zone name is required")
    private String zoneName;

    @NotNull(message = "Allowed vehicle type ID is required")
    private UUID vehicleTypeId;

    @NotNull(message = "Total capacity is required")
    @Min(value = 1, message = "Total capacity must be at least 1")
    private Integer totalCapacity;
}
