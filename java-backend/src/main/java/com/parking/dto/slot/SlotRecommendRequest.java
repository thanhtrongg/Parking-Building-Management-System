package com.parking.dto.slot;

import com.parking.enums.VehicleTypeEnum;
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
public class SlotRecommendRequest {

    @NotNull(message = "Building ID must not be null")
    private UUID buildingId;

    @NotNull(message = "Vehicle type must not be null")
    private VehicleTypeEnum vehicleType;
}
