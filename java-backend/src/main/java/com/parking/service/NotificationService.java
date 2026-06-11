package com.parking.service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Notification service interface for sending alerts to users.
 * Currently implemented as a logging stub — swap with Spring Mail
 * or a push notification provider for production.
 */
public interface NotificationService {

    /**
     * Send a reservation confirmation notification.
     */
    void sendReservationConfirmation(String email, UUID reservationId, String slotCode, String buildingName);

    /**
     * Send a payment receipt notification.
     */
    void sendPaymentReceipt(String email, UUID paymentId, BigDecimal amount, String method);

    /**
     * Send a session expiry alert (e.g., approaching max duration).
     */
    void sendSessionExpiryAlert(String email, UUID sessionId, String licensePlate);

    /**
     * Send a password reset token notification.
     */
    void sendPasswordResetToken(String email, String token, String resetUrl);
}
