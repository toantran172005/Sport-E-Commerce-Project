package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CancelOrderRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.OrderDetailResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.security.OrderAccessChecker;
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
    private final OrderAccessChecker orderAccessChecker;

    @PostMapping("/place-order")
    public ResponseEntity<ApiResponse<PlaceOrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlaceOrderRequest request) {
        // Luôn lấy user từ JWT; request.userId (nếu FE còn gửi) bị bỏ qua để không đặt hộ người khác.
        ApiResponse<PlaceOrderResponse> response = orderService.placeOrder(userPrincipal.getId(), request);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update-order-status")
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        ApiResponse<?> response = orderService.updateOrderStatus(userPrincipal.getId(), request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelOrderRequest request
    ) {
        Long userId = userPrincipal.getId();
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason()
                : "Khách hàng yêu cầu hủy đơn";
        ApiResponse<?> response = orderService.cancelOrder(userId, id, reason);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        orderAccessChecker.assertCanAccess(order, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", mapperUtil.mapOrderToOrderDetailResponse(order)));
    }
}
