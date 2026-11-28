package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.OrderDetailResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Order;
import jakarta.validation.Valid;

import java.util.List;

public interface OrderService {
    ApiResponse<PlaceOrderResponse> placeOrder(Long userId, @Valid PlaceOrderRequest request);

    void confirmOrder(Long orderId);

    /** ID các đơn thanh toán online còn PENDING, chưa thanh toán, tạo trước mốc {@code cutoff}. */
    java.util.List<Long> findExpiredUnpaidOrderIds(java.time.Instant cutoff, int limit);

    /**
     * Hủy 1 đơn quá hạn thanh toán (trả kho + mã giảm giá). Trả true nếu thực sự hủy.
     * Chạy trong transaction riêng cho từng đơn, có khóa dòng nên an toàn khi webhook về cùng lúc.
     */
    boolean expireOrderIfUnpaid(Long orderId, java.time.Instant cutoff);

    Order getOrderById(Long orderId);

    ApiResponse<?> updateOrderStatus(Long userId, @Valid UpdateOrderStatusRequest request);

    ApiResponse<?> cancelOrder(Long userId, Long orderId, String reason);

    ApiResponse<List<OrderDetailResponse>> getAllOrders();

    ApiResponse<List<OrderDetailResponse>> getMyOrders(Long userId);
}
