package com.sportecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceOrderResponse {
    private Long orderId;
    private String orderCode;
    private Double totalAmount;
}
