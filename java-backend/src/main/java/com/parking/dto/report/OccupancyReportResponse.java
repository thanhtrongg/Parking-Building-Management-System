package com.parking.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyReportResponse {

    private Integer totalSlots;
    private Integer occupiedSlots;
    private Integer availableSlots;
    private Integer reservedSlots;
    private Integer otherSlots;
    private Double occupancyRate;
    private List<FloorOccupancy> floorBreakdown;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class FloorOccupancy {
        private UUID floorId;
        private String floorName;
        private String buildingName;
        private Integer totalSlots;
        private Integer occupiedSlots;
        private Integer availableSlots;
        private Double occupancyRate;
    }
}
