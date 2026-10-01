package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.NotificationResponse;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.enums.OrderStatus;

public interface NotificationService {

    // Tao thong bao NEW_ORDER cho tat ca STAFF dang hoat dong khi co don hang moi
    void notifyStaffNewOrder(Long orderId, String orderCode);

    // Tao thong bao ORDER_UPDATE cho khach hang khi don hang cua ho doi trang thai.
    // Hien chua co noi nao goi ham nay (xem ghi chu trong OrderStatusChangedEvent).
    void notifyCustomerOrderStatusChanged(Long orderId, String orderCode, Long customerId,
                                           OrderStatus oldStatus, OrderStatus newStatus);

    ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(Long userId, int page, int size);

    ApiResponse<Long> countUnread(Long userId);

    ApiResponse<Void> markAsRead(Long userId, Long notificationId);

    ApiResponse<Void> markAllAsRead(Long userId);
}
