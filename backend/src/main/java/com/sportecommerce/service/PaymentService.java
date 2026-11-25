package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest);

    PaymentResponse confirmQrPayment(Long orderId);

    ApiResponse<Object> handleWebhook(Map<String, String> params);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse getPaymentById(Long paymentId);
}
