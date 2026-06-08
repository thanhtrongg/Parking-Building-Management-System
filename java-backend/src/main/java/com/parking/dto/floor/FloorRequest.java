package com.parking.dto.floor;

import com.parking.enums.VehicleTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class FloorRequest {

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    @NotBlank(message = "Floor name is required")
    private String floorName;

    private int floorNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleTypeEnum vehicleType;

    private int totalSlots;
}
