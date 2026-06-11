package com.parking.service.impl;

import com.parking.dto.payment.PaymentRequest;
import com.parking.dto.payment.PaymentResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.User;

import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import com.parking.service.AuditService;
import com.parking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final AuditService auditService;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        ParkingSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + request.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE && session.getStatus() != SessionStatus.LOST_TICKET) {
            throw new BadRequestException("Payment can only be processed for ACTIVE or LOST_TICKET sessions. Current status: " + session.getStatus());
        }

        // Release the parking slot
        ParkingSlot slot = session.getSlot();
        if (slot != null) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        // Finalize session status
        if (session.getStatus() == SessionStatus.ACTIVE) {
            session.setStatus(SessionStatus.COMPLETED);
        } // If LOST_TICKET, we keep it as LOST_TICKET for auditing / lost ticket reporting

        if (session.getCheckOutTime() == null) {
            session.setCheckOutTime(LocalDateTime.now());
        }
        sessionRepository.save(session);

        BigDecimal extraFee = request.getExtraFee() != null ? request.getExtraFee() : BigDecimal.ZERO;

        Payment payment = Payment.builder()
                .session(session)
                .amount(request.getAmount())
                .extraFee(extraFee)
                .method(request.getMethod())
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);
        auditService.log(null, "PAYMENT_PROCESSED", "Payment", payment.getId(),
                "Amount: " + payment.getAmount() + ", Method: " + payment.getMethod() + ", Session: " + session.getId());
        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsBySession(UUID sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("Parking session not found with id: " + sessionId);
        }
        return paymentRepository.findBySessionId(sessionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        ParkingSession session = payment.getSession();
        User driver = session != null ? session.getDriver() : null;
        ParkingSlot slot = session != null ? session.getSlot() : null;

        return PaymentResponse.builder()
                .id(payment.getId())
                .sessionId(session != null ? session.getId() : null)
                .amount(payment.getAmount())
                .extraFee(payment.getExtraFee())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .ticketCode(session != null ? session.getTicketCode() : null)
                .licensePlate(session != null ? session.getLicensePlate() : null)
                .driverName(driver != null ? driver.getFullName() : "Guest User")
                .driverEmail(driver != null ? driver.getEmail() : "No email")
                .vehicleType(session != null && session.getVehicleType() != null ? session.getVehicleType().name() : null)
                .slotCode(slot != null ? slot.getSlotCode() : null)
                .checkInTime(session != null ? session.getCheckInTime() : null)
                .checkOutTime(session != null ? session.getCheckOutTime() : null)
                .build();
    }
}
