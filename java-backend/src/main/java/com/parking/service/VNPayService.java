package com.parking.service;

import com.parking.dto.payment.VNPayResponse;

import java.util.Map;
import java.util.UUID;

public interface VNPayService {
    VNPayResponse createPayment(UUID sessionId, String ipAddress);
    Map<String, String> processIpn(Map<String, String> params);
}
