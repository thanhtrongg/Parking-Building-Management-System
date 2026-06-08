package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.CheckOutResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.service.ParkingSessionService;
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
@RequestMapping("/sessions")
@RequiredArgsConstructor
@Tag(name = "Parking Session Management", description = "Endpoints for vehicle check-in, check-out, and active sessions")
public class ParkingSessionController {

    private final ParkingSessionService sessionService;

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SessionResponse>> checkIn(
            @Valid @RequestBody CheckInRequest request,
            Principal principal) {
        SessionResponse response = sessionService.checkIn(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle checked in successfully", response));
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<CheckOutResponse>> checkOut(
            @PathVariable UUID id,
            @RequestParam(required = false) String gateOut,
            Principal principal) {
        CheckOutResponse response = sessionService.checkOut(id, gateOut, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Checkout processed. Pending payment.", response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getActiveSessions() {
        List<SessionResponse> response = sessionService.getActiveSessions();
        return ResponseEntity.ok(ApiResponse.success("Active sessions retrieved successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getMySessions(Principal principal) {
        List<SessionResponse> response = sessionService.getMySessions(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Your sessions retrieved successfully", response));
    }

    @PostMapping("/{id}/lost-ticket")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<CheckOutResponse>> lostTicket(
            @PathVariable UUID id,
            Principal principal) {
        CheckOutResponse response = sessionService.lostTicket(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Lost ticket processed. Pending payment.", response));
    }
}
