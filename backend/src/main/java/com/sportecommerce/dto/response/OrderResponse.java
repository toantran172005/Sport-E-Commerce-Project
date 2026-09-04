package com.sportecommerce.dto.response;

import com.sportecommerce.enums.OrderStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private String userName;
    private String orderCode;
    private OrderStatus status;
    private String shippingAddressSnapshot;
}
