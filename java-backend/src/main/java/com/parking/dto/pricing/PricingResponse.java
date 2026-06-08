package com.parking.dto.pricing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponse {

    private UUID id;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal lostTicketFee;
    private BigDecimal overtimeFeeMultiplier;
    private UUID buildingId;
    private String buildingName;
    private UUID vehicleTypeId;
    private String vehicleTypeName;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
}
