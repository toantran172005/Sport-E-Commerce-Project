package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    ApiResponse<List<OrderResponse>> getAllOrdersByUserId(Long userId);
}
