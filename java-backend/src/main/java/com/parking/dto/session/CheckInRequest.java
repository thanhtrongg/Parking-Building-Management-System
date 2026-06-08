package com.parking.dto.session;

import com.parking.enums.VehicleTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CheckInRequest {

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotNull(message = "Vehicle type is required")
    private VehicleTypeEnum vehicleType;

    private UUID slotId;

    private String gateIn;

    private UUID driverId;
}
