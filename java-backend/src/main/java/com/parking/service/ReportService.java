package com.parking.service;

import com.parking.dto.report.OccupancyReportResponse;
import com.parking.dto.report.PeakHoursReportResponse;
import com.parking.dto.report.RevenueReportResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface ReportService {

    RevenueReportResponse getRevenueReport(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId);

    OccupancyReportResponse getOccupancyReport(UUID buildingId);

    PeakHoursReportResponse getPeakHoursReport(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId);

    Page<SessionResponse> searchSessions(LocalDateTime startDate, LocalDateTime endDate, UUID buildingId, 
                                         SessionStatus status, String licensePlate, Pageable pageable);
}
