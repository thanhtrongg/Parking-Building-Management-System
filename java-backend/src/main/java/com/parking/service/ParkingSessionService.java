package com.parking.service;

import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.CheckOutResponse;
import com.parking.dto.session.SessionResponse;

import java.util.List;
import java.util.UUID;

public interface ParkingSessionService {

    SessionResponse checkIn(CheckInRequest request, String currentUserEmail);

    CheckOutResponse checkOut(UUID sessionId, String gateOut, String currentUserEmail);

    List<SessionResponse> getActiveSessions();

    List<SessionResponse> getMySessions(String currentUserEmail);

    CheckOutResponse lostTicket(UUID sessionId, String currentUserEmail);

    java.math.BigDecimal calculateSessionFee(UUID sessionId, java.time.LocalDateTime checkoutTime);
}
