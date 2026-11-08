package com.sportecommerce.dto.response;

import com.sportecommerce.enums.OrderStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long id;
    private String orderCode;
    private OrderStatus status;
    private Double subTotal;
    private Double discountAmount;
    private Double shippingFee;
    private Double totalAmount;
    private String recipientSnapshot;
    private String note;
    private Instant placedAt;
    private Instant confirmedAt;
}
