package com.parking.dto.slot;

import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
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
public class SlotRequest {

    @NotBlank(message = "Slot code is required")
    private String slotCode;

    private UUID floorId;

    private VehicleTypeEnum vehicleType;

    private String zoneId;

    private SlotStatus status;
}
