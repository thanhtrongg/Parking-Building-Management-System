package com.parking.service.impl;

import com.parking.dto.payment.VNPayResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.Pricing;
import com.parking.entity.VehicleType;
import com.parking.enums.PaymentMethod;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.enums.VehicleTypeEnum;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
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
    private final PricingRepository pricingRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    public VNPayResponse createPayment(UUID sessionId, String ipAddress, String currentUserEmail, String role) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId));

        if ("ROLE_DRIVER".equals(role)) {
            if (session.getDriver() == null || !session.getDriver().getEmail().equalsIgnoreCase(currentUserEmail)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to pay for this session.");
            }
        }

        if (session.getStatus() != SessionStatus.ACTIVE && session.getStatus() != SessionStatus.LOST_TICKET) {
            throw new BadRequestException("Payment can only be generated for ACTIVE or LOST_TICKET sessions.");
        }

        LocalDateTime checkoutTime = LocalDateTime.now();
        BigDecimal totalAmount = sessionService.calculateSessionFee(sessionId, checkoutTime);

        BigDecimal extraFee = BigDecimal.ZERO;
        BigDecimal baseAmount = totalAmount;

        if (session.getStatus() == SessionStatus.LOST_TICKET) {
            BigDecimal lostFee = getLostTicketFee(session);
            extraFee = lostFee;
            baseAmount = totalAmount.subtract(lostFee);
            if (baseAmount.compareTo(BigDecimal.ZERO) < 0) {
                baseAmount = BigDecimal.ZERO;
            }
        }

        // Check if there is already a PENDING payment for this session
        Payment payment = paymentRepository.findBySessionIdAndStatus(sessionId, PaymentStatus.PENDING).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .session(session)
                    .amount(baseAmount)
                    .extraFee(extraFee)
                    .method(PaymentMethod.VNPAY)
                    .status(PaymentStatus.PENDING)
                    .build();
        } else {
            payment.setAmount(baseAmount);
            payment.setExtraFee(extraFee);
            payment.setMethod(PaymentMethod.VNPAY);
            payment.setPaidAt(null);
        }
        paymentRepository.save(payment);

        // VNPay expects amount multiplied by 100 (in VND, so no decimal points)
        long vnpAmount = totalAmount.multiply(new BigDecimal("100")).longValue();

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
        List<String> queryList = new ArrayList<>();
        List<String> hashList = new ArrayList<>();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            String k = entry.getKey();
            String v = entry.getValue();
            if (v != null && !v.isEmpty()) {
                hashList.add(k + "=" + URLEncoder.encode(v, StandardCharsets.US_ASCII));
                queryList.add(URLEncoder.encode(k, StandardCharsets.US_ASCII) + "=" + URLEncoder.encode(v, StandardCharsets.US_ASCII));
            }
        }

        String queryUrl = String.join("&", queryList);
        String vnpSecureHash = hmacSHA512(hashSecret, String.join("&", hashList));
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

            List<String> hashList = new ArrayList<>();
            for (Map.Entry<String, String> entry : signableParams.entrySet()) {
                String k = entry.getKey();
                String v = entry.getValue();
                if (v != null && !v.isEmpty()) {
                    hashList.add(k + "=" + URLEncoder.encode(v, StandardCharsets.US_ASCII));
                }
            }

            String calculatedHash = hmacSHA512(hashSecret, String.join("&", hashList));
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

            // Retrieve the pending payment record
            Payment pendingPayment = paymentRepository.findBySessionIdAndStatus(sessionId, PaymentStatus.PENDING).orElse(null);
            if (pendingPayment == null) {
                response.put("RspCode", "01");
                response.put("Message", "Pending payment not found");
                return response;
            }

            // Verify amount
            BigDecimal expectedAmount = pendingPayment.getAmount().add(pendingPayment.getExtraFee());
            long expectedVnpAmount = expectedAmount.multiply(new BigDecimal("100")).longValue();
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

                if (session.getStatus() == SessionStatus.ACTIVE) {
                    session.setStatus(SessionStatus.COMPLETED);
                }
                session.setCheckOutTime(LocalDateTime.now());
                sessionRepository.save(session);

                pendingPayment.setStatus(PaymentStatus.PAID);
                pendingPayment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(pendingPayment);
            } else {
                paymentRepository.delete(pendingPayment);
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

    private BigDecimal getLostTicketFee(ParkingSession session) {
        UUID buildingId = session.getSlot().getFloor().getBuilding().getId();
        VehicleTypeEnum vehicleTypeEnum = session.getVehicleType();
        BigDecimal defaultLostFee = new BigDecimal("200000"); // Default 200k VND

        VehicleType vehicleType = vehicleTypeRepository.findByName(vehicleTypeEnum.name()).orElse(null);
        if (vehicleType != null) {
            Pricing pricing = pricingRepository.findByBuildingIdAndVehicleTypeId(buildingId, vehicleType.getId()).orElse(null);
            if (pricing != null && pricing.getLostTicketFee() != null) {
                return pricing.getLostTicketFee();
            }
        }
        return defaultLostFee;
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
