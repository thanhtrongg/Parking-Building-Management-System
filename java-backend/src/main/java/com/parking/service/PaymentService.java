package com.parking.service;

import com.parking.dto.payment.PaymentRequest;
import com.parking.dto.payment.PaymentResponse;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    PaymentResponse processPayment(PaymentRequest request);

    List<PaymentResponse> getPaymentsBySession(UUID sessionId);

    List<PaymentResponse> getAllPayments();
}
