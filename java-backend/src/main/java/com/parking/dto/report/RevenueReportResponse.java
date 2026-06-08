package com.parking.dto.report;

import com.parking.enums.VehicleTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponse {

    private BigDecimal totalRevenue;
    private BigDecimal totalBaseRevenue;
    private BigDecimal totalExtraFeeRevenue;
    private List<VehicleTypeRevenue> vehicleTypeBreakdown;
    private List<BuildingRevenue> buildingBreakdown;
    private List<DailyRevenue> dailyBreakdown;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VehicleTypeRevenue {
        private VehicleTypeEnum vehicleType;
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class BuildingRevenue {
        private UUID buildingId;
        private String buildingName;
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DailyRevenue {
        private LocalDate date;
        private BigDecimal amount;
    }
}
