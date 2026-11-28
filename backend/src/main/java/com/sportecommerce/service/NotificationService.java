package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.NotificationResponse;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.Order;
import com.sportecommerce.enums.OrderStatus;

public interface NotificationService {

    void notifyPaymentSuccess(Order order);

    void notifyPaymentFailed(Order order);

    void notifyOrderPlaced(Order order);

    void notifyPromotionCreated(Coupon coupon, String description);

    void notifyStaffNewOrder(Long orderId, String orderCode);

    void notifyCustomerOrderStatusChanged(Long orderId, String orderCode, Long customerId,
                                           OrderStatus oldStatus, OrderStatus newStatus);

    ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(Long userId, int page, int size);

    ApiResponse<Long> countUnread(Long userId);

    ApiResponse<Void> markAsRead(Long userId, Long notificationId);

    ApiResponse<Void> markAllAsRead(Long userId);
}
