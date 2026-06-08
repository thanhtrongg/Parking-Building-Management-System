package com.parking.dto.reservation;

import com.parking.enums.ReservationStatus;
import com.parking.enums.VehicleTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private UUID id;
    private UUID buildingId;
    private VehicleTypeEnum vehicleType;
    private LocalDateTime reservedFrom;
    private LocalDateTime reservedTo;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private UUID driverId;
    private String driverName;
    private UUID slotId;
    private String slotCode;
    private String buildingName;
    private String floorName;
}
