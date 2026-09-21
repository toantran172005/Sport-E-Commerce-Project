package com.sportecommerce.dto.response;

import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private String orderCode;
    private Double amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionCode;
    private Instant paidAt;
    private String paymentUrl;
    private String message;
}
