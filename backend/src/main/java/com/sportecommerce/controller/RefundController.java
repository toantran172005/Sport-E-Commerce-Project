package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.MarkRefundedRequest;
import com.sportecommerce.dto.response.RefundItemResponse;
import com.sportecommerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Danh sách khoản "chờ hoàn tiền" cho nhân viên. Hệ thống đồ án không hoàn tiền thật qua cổng thanh toán,
 * nên nhân viên hoàn thủ công rồi bấm xác nhận. Đường dẫn /api/admin/** chỉ cho ADMIN/STAFF (SecurityConfig).
 */
@RestController
@RequestMapping("/api/admin/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RefundItemResponse>>> getRefunds(
            @RequestParam(required = false, defaultValue = "false") boolean refunded) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getRefunds(refunded)));
    }

    @PatchMapping("/{paymentId}/refunded")
    public ResponseEntity<ApiResponse<RefundItemResponse>> markRefunded(
            @PathVariable Long paymentId,
            @Valid @RequestBody(required = false) MarkRefundedRequest request) {
        String note = request != null ? request.getNote() : null;
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận hoàn tiền", paymentService.markRefunded(paymentId, note)));
    }
}
