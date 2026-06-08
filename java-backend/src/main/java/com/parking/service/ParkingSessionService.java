package com.parking.service;

import com.parking.dto.session.CheckInRequest;
import com.parking.dto.session.CheckOutResponse;
import com.parking.dto.session.SessionResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ParkingSessionService {

    SessionResponse checkIn(CheckInRequest request, String currentUserEmail);

    CheckOutResponse checkOut(UUID sessionId, String gateOut, String currentUserEmail);

    List<SessionResponse> getActiveSessions();

    Page<SessionResponse> getMySessions(String currentUserEmail, Pageable pageable);

    CheckOutResponse lostTicket(UUID sessionId, String currentUserEmail);

    java.math.BigDecimal calculateSessionFee(UUID sessionId, java.time.LocalDateTime checkoutTime);

    SessionResponse assignSlot(UUID sessionId, UUID slotId, String currentUserEmail);
}
