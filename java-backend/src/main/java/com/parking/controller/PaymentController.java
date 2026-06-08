package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.payment.PaymentRequest;
import com.parking.dto.payment.PaymentResponse;
import com.parking.dto.payment.VNPayResponse;
import com.parking.service.PaymentService;
import com.parking.service.VNPayService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Endpoints for processing and querying payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnpayService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment processed successfully", response));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsBySession(@PathVariable UUID sessionId) {
        List<PaymentResponse> response = paymentService.getPaymentsBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session payments retrieved successfully", response));
    }

    @GetMapping("/vnpay/create")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<VNPayResponse>> createVNPayPayment(
            @RequestParam UUID sessionId,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        VNPayResponse response = vnpayService.createPayment(sessionId, ipAddress);
        return ResponseEntity.ok(ApiResponse.success("VNPay payment URL generated successfully", response));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> processVNPayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> response = vnpayService.processIpn(params);
        return ResponseEntity.ok(response);
    }
}
