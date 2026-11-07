package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CancelOrderRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.OrderDetailResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.util.MapperUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final MapperUtil mapperUtil;

    @PostMapping("/place-order")
    public ResponseEntity<ApiResponse<PlaceOrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlaceOrderRequest request) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : (request.getUserId() != null ? request.getUserId() : 4L);
        ApiResponse<PlaceOrderResponse> response = orderService.placeOrder(userId, request);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update-order-status")
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : 4L;
        ApiResponse<?> response = orderService.updateOrderStatus(userId, request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelOrderRequest request
    ) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : 4L;
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason()
                : "Khách hàng yêu cầu hủy đơn";
        ApiResponse<?> response = orderService.cancelOrder(userId, id, reason);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", mapperUtil.mapOrderToOrderDetailResponse(orderService.getOrderById(id))));
    }
}
