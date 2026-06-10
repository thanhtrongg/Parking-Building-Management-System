package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.reservation.ReservationRequest;
import com.parking.dto.reservation.ReservationResponse;
import com.parking.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Parking slot reservation management")
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "Create a new reservation")
    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationRequest request,
            Principal principal) {
        ReservationResponse response = reservationService.createReservation(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot reserved successfully", response));
    }

    @Operation(summary = "Cancel a reservation")
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DRIVER', 'MANAGER', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable UUID id,
            Principal principal) {
        ReservationResponse response = reservationService.cancelReservation(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", response));
    }

    @Operation(summary = "Get current driver's reservations")
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(Principal principal) {
        List<ReservationResponse> response = reservationService.getMyReservations(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Your reservations retrieved successfully", response));
    }

    @Operation(summary = "Get reservations by status (manager)")
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getReservationsByStatus(
            @RequestParam(required = false) String status) {
        List<ReservationResponse> response = reservationService.getReservationsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved successfully", response));
    }
}
