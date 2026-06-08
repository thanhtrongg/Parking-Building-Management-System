package com.parking.dto.payment;

import com.parking.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private BigDecimal extraFee;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;
}
