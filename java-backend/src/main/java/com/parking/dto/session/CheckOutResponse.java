package com.parking.dto.session;

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
public class CheckOutResponse {

    private UUID sessionId;
    private String ticketCode;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private double durationHours;
    private BigDecimal amount;
    private BigDecimal extraFee;
    private BigDecimal totalAmount;
}
