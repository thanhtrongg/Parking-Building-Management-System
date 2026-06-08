package com.parking.dto.payment;

import com.parking.enums.PaymentMethod;
import com.parking.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID sessionId;
    private BigDecimal amount;
    private BigDecimal extraFee;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paidAt;
}
