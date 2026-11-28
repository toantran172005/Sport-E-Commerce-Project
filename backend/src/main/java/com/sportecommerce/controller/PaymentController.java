package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.security.OrderAccessChecker;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final OrderAccessChecker orderAccessChecker;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        orderAccessChecker.assertCanAccess(orderService.getOrderById(request.getOrderId()), userPrincipal);
        PaymentResponse response = paymentService.createPayment(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Xử lý yêu cầu thanh toán thành công", response));
    }

    @PostMapping("/confirm/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmQrPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long orderId) {

        // Khách KHÔNG được tự xác nhận đã trả tiền. Thanh toán VNPay được ghi nhận tự động qua
        // return URL / IPN có chữ ký. Endpoint này chỉ là lối thủ công cho nhân viên.
        if (userPrincipal == null || !userPrincipal.isStaff()) {
            throw new AppException("Chỉ nhân viên mới được xác nhận thanh toán thủ công", HttpStatus.FORBIDDEN);
        }
        PaymentResponse response = paymentService.confirmQrPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán thành công", response));
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

    /**
     * IPN của VNPay (server VNPay gọi tới, không có JWT; xác thực bằng chữ ký bên trong service).
     * Cấu hình URL này trong cổng quản trị sandbox VNPay. Chạy local cần tunnel (ngrok/cloudflared).
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVnPayIpn(@RequestParam Map<String, String> queryParams) {
        try {
            return ResponseEntity.ok(paymentService.handleIpn(queryParams));
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("RspCode", "99");
            error.put("Message", "Unknown error");
            return ResponseEntity.ok(error);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long orderId) {

        orderAccessChecker.assertCanAccess(orderService.getOrderById(orderId), userPrincipal);
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        PaymentResponse response = paymentService.getPaymentById(id);
        orderAccessChecker.assertCanAccess(orderService.getOrderById(response.getOrderId()), userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
