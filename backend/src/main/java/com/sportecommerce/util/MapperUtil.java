package com.sportecommerce.util;

import com.sportecommerce.dto.response.OrderResponse;
import com.sportecommerce.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class MapperUtil {

    public OrderResponse mapOrderToOrderResponse(Order order) {
        return OrderResponse
                .builder()
                .userName(order.getUser().getFullName())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .shippingAddressSnapshot(order.getShippingAddressSnapshot())
                .build();
    }

}
