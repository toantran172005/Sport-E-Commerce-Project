package com.sportecommerce.dto.response;

import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * 1 khoản thanh toán cần hoàn tiền cho khách (đơn đã thu tiền nhưng bị hủy/trả hàng).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundItemResponse {
    private Long paymentId;
    private Long orderId;
    private String orderCode;
    private OrderStatus orderStatus;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Double amount;
    private PaymentMethod method;
    private String transactionCode;
    private Instant paidAt;
    private Instant refundedAt;
    private String refundNote;
}
