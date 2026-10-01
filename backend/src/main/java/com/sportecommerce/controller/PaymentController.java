package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        PaymentResponse response = paymentService.createPayment(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Xử lý yêu cầu thanh toán thành công", response));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Object>> handleWebhookPost(
            @RequestParam(required = false) Map<String, String> queryParams,
            @RequestBody(required = false) Map<String, String> bodyParams) {

        Map<String, String> allParams = new HashMap<>();
        if (queryParams != null) {
            allParams.putAll(queryParams);
        }
        if (bodyParams != null) {
            allParams.putAll(bodyParams);
        }

        ApiResponse<Object> response = paymentService.handleWebhook(allParams);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/webhook")
    public ResponseEntity<ApiResponse<Object>> handleWebhookGet(
            @RequestParam Map<String, String> queryParams) {

        ApiResponse<Object> response = paymentService.handleWebhook(queryParams);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(
            @PathVariable Long orderId) {

        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable Long id) {

        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
