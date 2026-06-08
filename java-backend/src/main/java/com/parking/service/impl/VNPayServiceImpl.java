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
import com.parking.service.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VNPayServiceImpl implements VNPayService {

    @Value("${app.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${app.vnpay.pay-url}")
    private String payUrl;

    @Value("${app.vnpay.return-url}")
    private String returnUrl;

    private final ParkingSessionService sessionService;
    private final ParkingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final ParkingSlotRepository slotRepository;

    @Override
    public VNPayResponse createPayment(UUID sessionId, String ipAddress) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE && session.getStatus() != SessionStatus.LOST_TICKET) {
            throw new BadRequestException("Payment can only be generated for ACTIVE or LOST_TICKET sessions.");
        }

        LocalDateTime checkoutTime = LocalDateTime.now();
        BigDecimal amount = sessionService.calculateSessionFee(sessionId, checkoutTime);

        // VNPay expects amount multiplied by 100 (in VND, so no decimal points)
        long vnpAmount = amount.multiply(new BigDecimal("100")).longValue();

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", sessionId.toString());
        vnpParams.put("vnp_OrderInfo", "Thanh toan phi gui xe, ticket: " + session.getTicketCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress != null ? ipAddress : "127.0.0.1");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(formatter));

        // Build query data and hash data
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = vnpParams.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String k = entry.getKey();
            String v = entry.getValue();
            if (v != null && !v.isEmpty()) {
                hashData.append(k).append("=").append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append("&");
                    hashData.append("&");
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        String paymentUrl = payUrl + "?" + queryUrl;
        return VNPayResponse.builder().paymentUrl(paymentUrl).build();
    }

    @Override
    public Map<String, String> processIpn(Map<String, String> params) {
        Map<String, String> response = new HashMap<>();

        try {
            // Verify checksum signature
            String vnpSecureHash = params.get("vnp_SecureHash");
            Map<String, String> signableParams = new TreeMap<>(params);
            signableParams.remove("vnp_SecureHash");
            signableParams.remove("vnp_SecureHashType");

            StringBuilder hashData = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = signableParams.entrySet().iterator();
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

            String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
            if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
                response.put("RspCode", "97");
                response.put("Message", "Invalid signature");
                return response;
            }

            // Extract order details
            String txnRef = params.get("vnp_TxnRef");
            UUID sessionId = UUID.fromString(txnRef);

            Optional<ParkingSession> sessionOpt = sessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) {
                response.put("RspCode", "01");
                response.put("Message", "Order not found");
                return response;
            }

            ParkingSession session = sessionOpt.get();

            // Verify order status
            if (session.getStatus() == SessionStatus.COMPLETED) {
                response.put("RspCode", "02");
                response.put("Message", "Order already confirmed");
                return response;
            }

            // Verify amount
            BigDecimal sessionAmount = sessionService.calculateSessionFee(sessionId, LocalDateTime.now());
            long expectedVnpAmount = sessionAmount.multiply(new BigDecimal("100")).longValue();
            long actualVnpAmount = Long.parseLong(params.get("vnp_Amount"));

            if (actualVnpAmount != expectedVnpAmount) {
                response.put("RspCode", "04");
                response.put("Message", "Invalid amount");
                return response;
            }

            // Check response code from VNPay
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                // Success: update status
                ParkingSlot slot = session.getSlot();
                if (slot != null) {
                    slot.setStatus(SlotStatus.AVAILABLE);
                    slotRepository.save(slot);
                }

                session.setStatus(SessionStatus.COMPLETED);
                session.setCheckOutTime(LocalDateTime.now());
                sessionRepository.save(session);

                Payment payment = Payment.builder()
                        .session(session)
                        .amount(sessionAmount)
                        .extraFee(BigDecimal.ZERO)
                        .method(PaymentMethod.VNPAY)
                        .status(PaymentStatus.PAID)
                        .paidAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);
            }

            response.put("RspCode", "00");
            response.put("Message", "Confirm success");

        } catch (Exception e) {
            log.error("Failed to process VNPay IPN request: ", e);
            response.put("RspCode", "99");
            response.put("Message", "Input data required");
        }

        return response;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKey);
            byte[] hashBytes = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA512", e);
        }
    }
}
