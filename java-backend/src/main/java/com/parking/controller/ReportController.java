package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.report.OccupancyReportResponse;
import com.parking.dto.report.PeakHoursReportResponse;
import com.parking.dto.report.RevenueReportResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.enums.SessionStatus;
import com.parking.exception.BadRequestException;
import com.parking.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
@Tag(name = "Report & Dashboard Management", description = "Endpoints for retrieving system reports and dashboard metrics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID buildingId) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        RevenueReportResponse response = reportService.getRevenueReport(startDate, endDate, buildingId);
        return ResponseEntity.ok(ApiResponse.success("Revenue report retrieved successfully", response));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<OccupancyReportResponse>> getOccupancyReport(
            @RequestParam(required = false) UUID buildingId) {

        OccupancyReportResponse response = reportService.getOccupancyReport(buildingId);
        return ResponseEntity.ok(ApiResponse.success("Occupancy report retrieved successfully", response));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<ApiResponse<PeakHoursReportResponse>> getPeakHoursReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID buildingId) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        PeakHoursReportResponse response = reportService.getPeakHoursReport(startDate, endDate, buildingId);
        return ResponseEntity.ok(ApiResponse.success("Peak hours report retrieved successfully", response));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<Page<SessionResponse>>> searchSessions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID buildingId,
            @RequestParam(required = false) SessionStatus status,
            @RequestParam(required = false) String licensePlate,
            @PageableDefault(size = 10) Pageable pageable) {

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        Page<SessionResponse> response = reportService.searchSessions(startDate, endDate, buildingId, status, licensePlate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Parking sessions retrieved successfully", response));
    }
}
