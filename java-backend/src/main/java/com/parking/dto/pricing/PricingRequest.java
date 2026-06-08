package com.parking.dto.pricing;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PricingRequest {

    @NotNull(message = "Hourly rate is required")
    private BigDecimal hourlyRate;

    private BigDecimal dailyRate;
    private BigDecimal lostTicketFee;
    private BigDecimal overtimeFeeMultiplier;

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    @NotNull(message = "Vehicle type ID is required")
    private UUID vehicleTypeId;

    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
}
