package com.parking.dto.floor;

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
public class FloorResponse {

    private UUID id;
    private UUID buildingId;
    private String buildingName;
    private String floorName;
    private int floorNumber;
    private VehicleTypeEnum vehicleType;
    private int totalSlots;
    private int availableSlots;
    private int occupiedSlots;
    private boolean active;
}
