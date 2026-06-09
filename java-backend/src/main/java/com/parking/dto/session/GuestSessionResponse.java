package com.parking.dto.session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSessionResponse {
    private SessionResponse session;
    private BigDecimal accumulatedFee;
}
