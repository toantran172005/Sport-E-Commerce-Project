package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.enums.OrderStatus;
import jakarta.validation.Valid;

public interface OrderService {
    ApiResponse<PlaceOrderResponse> placeOrder(Long userId, @Valid PlaceOrderRequest request);

    void confirmOrder(Long orderId);

    Order getOrderById(Long orderId);
    ApiResponse<?> updateOrderStatus(Long userId, @Valid UpdateOrderStatusRequest request);

}

