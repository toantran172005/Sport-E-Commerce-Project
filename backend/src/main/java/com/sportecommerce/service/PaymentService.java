package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.dto.response.RefundItemResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest);

    PaymentResponse confirmQrPayment(Long orderId);

    ApiResponse<Object> handleWebhook(Map<String, String> params);

    /**
     * IPN (server-to-server) của VNPay: trả về đúng định dạng {"RspCode","Message"} theo tài liệu VNPay.
     */
    Map<String, String> handleIpn(Map<String, String> params);

    /** Danh sách khoản cần hoàn tiền: refunded=false là đang chờ hoàn, true là đã hoàn. */
    List<RefundItemResponse> getRefunds(boolean refunded);

    /** Nhân viên xác nhận đã hoàn tiền thật cho khách. */
    RefundItemResponse markRefunded(Long paymentId, String note);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse getPaymentById(Long paymentId);
}
