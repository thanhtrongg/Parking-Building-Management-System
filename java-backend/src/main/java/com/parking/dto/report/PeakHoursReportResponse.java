package com.parking.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakHoursReportResponse {

    private List<HourlyArrival> hourlyArrivals;
    private List<DailyArrival> dailyArrivals;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class HourlyArrival {
        private Integer hour;
        private Long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DailyArrival {
        private String dayOfWeek;
        private Long count;
    }
}
