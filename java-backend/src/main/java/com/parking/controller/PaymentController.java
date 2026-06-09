package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.payment.PaymentRequest;
import com.parking.dto.payment.PaymentResponse;
import com.parking.dto.payment.VNPayResponse;
import com.parking.service.PaymentService;
import com.parking.service.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing and VNPay integration")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnpayService;

    @Operation(summary = "Process a payment")
    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment processed successfully", response));
    }

    @Operation(summary = "Get payments by session ID")
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsBySession(@PathVariable UUID sessionId) {
        List<PaymentResponse> response = paymentService.getPaymentsBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session payments retrieved successfully", response));
    }

    @Operation(summary = "Create a VNPay payment URL")
    @GetMapping("/vnpay/create")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<VNPayResponse>> createVNPayPayment(
            @RequestParam UUID sessionId,
            HttpServletRequest httpRequest,
            Authentication authentication) {
        String xff = httpRequest.getHeader("X-Forwarded-For");
        String ipAddress = (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : httpRequest.getRemoteAddr();
        String currentUserEmail = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");
        VNPayResponse response = vnpayService.createPayment(sessionId, ipAddress, currentUserEmail, role);
        return ResponseEntity.ok(ApiResponse.success("VNPay payment URL generated successfully", response));
    }

    @Operation(summary = "Handle VNPay IPN callback")
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> processVNPayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> response = vnpayService.processIpn(params);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create a VNPay payment URL for guests")
    @GetMapping("/vnpay/create-guest")
    public ResponseEntity<ApiResponse<VNPayResponse>> createGuestPayment(
            @RequestParam UUID sessionId,
            HttpServletRequest httpRequest) {
        String xff = httpRequest.getHeader("X-Forwarded-For");
        String ipAddress = (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : httpRequest.getRemoteAddr();
        
        VNPayResponse response = vnpayService.createPayment(sessionId, ipAddress, null, "ROLE_ANONYMOUS");
        return ResponseEntity.ok(ApiResponse.success("VNPay payment URL generated successfully", response));
    }
}
