package com.parking.dto.reservation;

import com.parking.enums.VehicleTypeEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationRequest {

    @NotNull(message = "Vehicle type is required")
    private VehicleTypeEnum vehicleType;

    @NotNull(message = "Reserved from time is required")
    private LocalDateTime reservedFrom;

    @NotNull(message = "Reserved to time is required")
    private LocalDateTime reservedTo;

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    private UUID slotId;
}
