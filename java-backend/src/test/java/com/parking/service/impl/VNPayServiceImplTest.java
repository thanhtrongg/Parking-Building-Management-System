package com.parking.service.impl;

import com.parking.dto.payment.VNPayResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.enums.PaymentMethod;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import com.parking.service.ParkingSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import com.parking.entity.User;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VNPayServiceImplTest {

    @Mock
    private ParkingSessionService sessionService;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @InjectMocks
    private VNPayServiceImpl vnpayService;

    private UUID sessionId;
    private ParkingSession session;

    @BeforeEach
    void setUp() {
        sessionId = UUID.randomUUID();
        session = ParkingSession.builder()
                .id(sessionId)
                .ticketCode("T-12345")
                .status(SessionStatus.ACTIVE)
                .build();

        ReflectionTestUtils.setField(vnpayService, "tmnCode", "TEST_TMN");
        ReflectionTestUtils.setField(vnpayService, "hashSecret", "TEST_SECRET");
        ReflectionTestUtils.setField(vnpayService, "payUrl", "http://test.pay.url");
        ReflectionTestUtils.setField(vnpayService, "returnUrl", "http://test.return.url");
    }

    @Test
    @DisplayName("Create Payment - Success")
    void testCreatePayment_Success() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionService.calculateSessionFee(eq(sessionId), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("50000"));

        VNPayResponse response = vnpayService.createPayment(sessionId, "127.0.0.1", "staff@parking.com", "ROLE_STAFF");

        assertNotNull(response);
        assertNotNull(response.getPaymentUrl());
        assertTrue(response.getPaymentUrl().startsWith("http://test.pay.url?"));
        assertTrue(response.getPaymentUrl().contains("vnp_Amount=5000000"));
        assertTrue(response.getPaymentUrl().contains("vnp_TxnRef=" + sessionId.toString()));
        assertTrue(response.getPaymentUrl().contains("vnp_SecureHash="));
    }

    @Test
    @DisplayName("Create Payment - Session Not Found")
    void testCreatePayment_SessionNotFound() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                vnpayService.createPayment(sessionId, "127.0.0.1", "staff@parking.com", "ROLE_STAFF"));
    }

    @Test
    @DisplayName("Create Payment - Invalid Session Status")
    void testCreatePayment_InvalidSessionStatus() {
        session.setStatus(SessionStatus.COMPLETED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(BadRequestException.class, () ->
                vnpayService.createPayment(sessionId, "127.0.0.1", "staff@parking.com", "ROLE_STAFF"));
    }

    @Test
    @DisplayName("Create Payment - Driver Success")
    void testCreatePayment_DriverSuccess() {
        User driver = User.builder().email("driver@parking.com").build();
        session.setDriver(driver);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionService.calculateSessionFee(eq(sessionId), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("50000"));

        VNPayResponse response = vnpayService.createPayment(sessionId, "127.0.0.1", "driver@parking.com", "ROLE_DRIVER");

        assertNotNull(response);
        assertNotNull(response.getPaymentUrl());
    }

    @Test
    @DisplayName("Create Payment - Driver IDOR Access Denied")
    void testCreatePayment_DriverIDOR() {
        User driver = User.builder().email("owner@parking.com").build();
        session.setDriver(driver);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(AccessDeniedException.class, () ->
                vnpayService.createPayment(sessionId, "127.0.0.1", "hacker@parking.com", "ROLE_DRIVER"));
    }

    @Test
    @DisplayName("Process IPN - Invalid Signature")
    void testProcessIpn_InvalidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", sessionId.toString());
        params.put("vnp_SecureHash", "WRONG_HASH");

        Map<String, String> result = vnpayService.processIpn(params);

        assertEquals("97", result.get("RspCode"));
        assertEquals("Invalid signature", result.get("Message"));
    }

    @Test
    @DisplayName("Process IPN - Success")
    void testProcessIpn_Success() {
        ParkingSlot slot = ParkingSlot.builder()
                .status(SlotStatus.OCCUPIED)
                .build();
        session.setSlot(slot);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionService.calculateSessionFee(eq(sessionId), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("50000"));

        // Build valid request parameters matching what processIpn does
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "5000000"); // 50,000 * 100
        params.put("vnp_TxnRef", sessionId.toString());
        params.put("vnp_ResponseCode", "00");

        // Compute HMAC
        String secureHash = computeTestSecureHash(params);
        params.put("vnp_SecureHash", secureHash);

        Map<String, String> result = vnpayService.processIpn(params);

        assertEquals("00", result.get("RspCode"));
        assertEquals("Confirm success", result.get("Message"));

        // Verify session and slot state updates
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        assertNotNull(session.getCheckOutTime());
        assertEquals(SlotStatus.AVAILABLE, slot.getStatus());

        verify(slotRepository, times(1)).save(slot);
        verify(sessionRepository, times(1)).save(session);

        // Verify payment creation
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository, times(1)).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();
        assertEquals(session, savedPayment.getSession());
        assertEquals(new BigDecimal("50000"), savedPayment.getAmount());
        assertEquals(PaymentMethod.VNPAY, savedPayment.getMethod());
        assertEquals(PaymentStatus.PAID, savedPayment.getStatus());
    }

    @Test
    @DisplayName("Process IPN - Session Not Found")
    void testProcessIpn_SessionNotFound() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", sessionId.toString());
        params.put("vnp_Amount", "5000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", computeTestSecureHash(params));

        Map<String, String> result = vnpayService.processIpn(params);

        assertEquals("01", result.get("RspCode"));
        assertEquals("Order not found", result.get("Message"));
    }

    @Test
    @DisplayName("Process IPN - Already Confirmed")
    void testProcessIpn_AlreadyConfirmed() {
        session.setStatus(SessionStatus.COMPLETED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", sessionId.toString());
        params.put("vnp_Amount", "5000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", computeTestSecureHash(params));

        Map<String, String> result = vnpayService.processIpn(params);

        assertEquals("02", result.get("RspCode"));
        assertEquals("Order already confirmed", result.get("Message"));
    }

    @Test
    @DisplayName("Process IPN - Invalid Amount")
    void testProcessIpn_InvalidAmount() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionService.calculateSessionFee(eq(sessionId), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("50000"));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", sessionId.toString());
        params.put("vnp_Amount", "4000000"); // incorrect amount
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", computeTestSecureHash(params));

        Map<String, String> result = vnpayService.processIpn(params);

        assertEquals("04", result.get("RspCode"));
        assertEquals("Invalid amount", result.get("Message"));
    }

    private String computeTestSecureHash(Map<String, String> params) {
        try {
            java.util.TreeMap<String, String> sorted = new java.util.TreeMap<>(params);
            sorted.remove("vnp_SecureHash");
            sorted.remove("vnp_SecureHashType");

            StringBuilder hashData = new StringBuilder();
            java.util.Iterator<Map.Entry<String, String>> itr = sorted.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                String k = entry.getKey();
                String v = entry.getValue();
                if (v != null && !v.isEmpty()) {
                    hashData.append(k).append("=").append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) {
                        hashData.append("&");
                    }
                }
            }

            javax.crypto.Mac sha512Hmac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec("TEST_SECRET".getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKey);
            byte[] hashBytes = sha512Hmac.doFinal(hashData.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
