package com.parking.service;

import com.parking.dto.reservation.ReservationRequest;
import com.parking.dto.reservation.ReservationResponse;

import java.util.List;
import java.util.UUID;

public interface ReservationService {

    ReservationResponse createReservation(ReservationRequest request, String currentUserEmail);

    ReservationResponse cancelReservation(UUID id, String currentUserEmail);

    List<ReservationResponse> getMyReservations(String currentUserEmail);

    List<ReservationResponse> getReservationsByStatus(String status);
}
