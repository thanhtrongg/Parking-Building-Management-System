package com.parking.service.impl;

import com.parking.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Logging stub implementation of NotificationService.
 * In production, replace this with Spring Mail (spring-boot-starter-mail),
 * Firebase Cloud Messaging, or any push notification provider.
 */
@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Override
    @Async
    public void sendReservationConfirmation(String email, UUID reservationId, String slotCode, String buildingName) {
        log.info("[NOTIFICATION] Reservation confirmed — to={}, reservationId={}, slot={}, building={}",
                email, reservationId, slotCode, buildingName);
    }

    @Override
    @Async
    public void sendPaymentReceipt(String email, UUID paymentId, BigDecimal amount, String method) {
        log.info("[NOTIFICATION] Payment receipt — to={}, paymentId={}, amount={}, method={}",
                email, paymentId, amount, method);
    }

    @Override
    @Async
    public void sendSessionExpiryAlert(String email, UUID sessionId, String licensePlate) {
        log.info("[NOTIFICATION] Session expiry alert — to={}, sessionId={}, licensePlate={}",
                email, sessionId, licensePlate);
    }

    @Override
    @Async
    public void sendPasswordResetToken(String email, String token, String resetUrl) {
        log.info("[NOTIFICATION] Password reset request — to={}, token={}, resetUrl={}",
                email, token, resetUrl);
    }
}
