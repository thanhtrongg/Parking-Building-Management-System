package com.parking.dto.session;

import com.parking.enums.SessionStatus;
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
public class SessionResponse {

    private UUID id;
    private String licensePlate;
    private VehicleTypeEnum vehicleType;
    private String ticketCode;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private LocalDateTime parkedAt;
    private SessionStatus status;
    private String gateIn;
    private String gateOut;
    private UUID slotId;
    private String slotCode;
    private UUID driverId;
    private String driverName;
    private UUID staffInId;
    private String staffInName;
    private UUID staffOutId;
    private String staffOutName;
    private java.math.BigDecimal totalFee;
    private com.parking.dto.payment.PaymentResponse payment;
}

