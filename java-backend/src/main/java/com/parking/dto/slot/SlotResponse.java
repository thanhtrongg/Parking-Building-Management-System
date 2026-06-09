package com.parking.dto.slot;

import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponse {

    private UUID id;
    private UUID floorId;
    private String floorName;
    private String slotCode;
    private SlotStatus status;
    private VehicleTypeEnum vehicleType;
    private String zone;
}
