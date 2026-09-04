package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.OrderResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MapperUtil mapperUtil;

    @Override
    public ApiResponse<List<OrderResponse>> getAllOrdersByUserId(Long userId) {

        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new AppException("Khong tim thay user voi id: " + userId);
        }

        List<Order> orders = orderRepository.getOrdersByUser_Id(userId);

        List<OrderResponse> orderResponses = orders
                .stream()
                .map(mapperUtil::mapOrderToOrderResponse)
                .toList();

        return ApiResponse.success(orderResponses);

    }
}
