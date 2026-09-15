package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import jakarta.validation.Valid;


public interface OrderService {
    ApiResponse<PlaceOrderResponse> placeOrder(Long userId, @Valid PlaceOrderRequest request);
}
