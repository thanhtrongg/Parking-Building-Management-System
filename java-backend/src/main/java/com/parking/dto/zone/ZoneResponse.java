package com.parking.dto.zone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneResponse {

    private UUID id;
    private String zoneName;
    private UUID vehicleTypeId;
    private int totalCapacity;
    private UUID buildingId;
}
