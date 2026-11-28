package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CancelOrderRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.OrderDetailResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.security.OrderAccessChecker;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.IdempotencyService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.util.MapperUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final IdempotencyService idempotencyService;

    @PostMapping("/place-order")
    public ResponseEntity<ApiResponse<PlaceOrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PlaceOrderRequest request) {
        Long userId = userPrincipal.getId();
        String key = normalizeIdempotencyKey(idempotencyKey);

        // Chống đặt trùng: cùng Idempotency-Key chỉ tạo 1 đơn (bấm 2 lần / client gửi lại do mạng chậm)
        if (key != null) {
            IdempotencyService.Result begin = idempotencyService.begin(userId, key);
            if (begin.state() == IdempotencyService.State.IN_PROGRESS) {
                throw new AppException("Đơn hàng đang được xử lý, vui lòng đợi giây lát", HttpStatus.CONFLICT);
            }
            if (begin.state() == IdempotencyService.State.COMPLETED) {
                Order existing = orderService.getOrderById(Long.valueOf(begin.value()));
                orderAccessChecker.assertCanAccess(existing, userPrincipal);
                return ResponseEntity.ok(ApiResponse.success("Đơn hàng đã được đặt trước đó",
                        mapperUtil.mapOrderToPlaceOrderResponse(existing)));
            }
            if (begin.state() == IdempotencyService.State.UNAVAILABLE) {
                key = null;
            }
        }

        try {
            // Luôn lấy user từ JWT; request.userId (nếu FE còn gửi) bị bỏ qua để không đặt hộ người khác.
            ApiResponse<PlaceOrderResponse> response = orderService.placeOrder(userId, request);
            if (key != null && response.getData() != null) {
                idempotencyService.complete(userId, key, response.getData().getOrderId());
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            if (key != null) {
                idempotencyService.release(userId, key);
            }
            throw ex;
        }
    }

    /** Chỉ nhận khóa dạng UUID/chuỗi an toàn ≤ 100 ký tự; sai định dạng coi như không gửi. */
    private static String normalizeIdempotencyKey(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.matches("[A-Za-z0-9_-]{8,100}") ? trimmed : null;
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

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<OrderDetailResponse>>> getAllOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ApiResponse<java.util.List<OrderDetailResponse>> response = orderService.getAllOrders();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<java.util.List<OrderDetailResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new com.sportecommerce.exception.AppException("Vui lòng đăng nhập!");
        }
        ApiResponse<java.util.List<OrderDetailResponse>> response = orderService.getMyOrders(userPrincipal.getId());
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
