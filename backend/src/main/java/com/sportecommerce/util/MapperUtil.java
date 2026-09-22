package com.sportecommerce.util;

import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class MapperUtil {

    public PlaceOrderResponse mapOrderToPlaceOrderResponse(Order order) {
        return PlaceOrderResponse
                .builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .build();
    }

    public com.sportecommerce.dto.response.OrderDetailResponse mapOrderToOrderDetailResponse(Order order) {
        return com.sportecommerce.dto.response.OrderDetailResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .recipientSnapshot(order.getShippingAddressSnapshot())
                .note(order.getNote())
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .build();
    }

}
