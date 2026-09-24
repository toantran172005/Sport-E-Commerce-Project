package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.response.OrderDetailResponse;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.util.MapperUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/order", "/api/orders"})
public class OrderController {

    public final OrderService orderService;
    private final MapperUtil mapperUtil;

    @PostMapping("/place-order")
    public ResponseEntity<ApiResponse<PlaceOrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlaceOrderRequest request) {
//        Long userId = userPrincipal.getId();
        Long userId = 7L;
        ApiResponse<PlaceOrderResponse> response = orderService.placeOrder(userId, request);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update-order-status")
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateOrderStatusRequest request
            ) {
//        Long userId = userPrincipal.getId();
        Long userId = 2L;
        ApiResponse<?> response = orderService.updateOrderStatus(userId, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(mapperUtil.mapOrderToOrderDetailResponse(order)));
    }
}

