package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.NotificationResponse;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.enums.OrderStatus;

public interface NotificationService {

    // ===== Nhom 1: thong bao gan voi luong dat hang / thanh toan (nhan Order truc tiep) =====
    // Goi truc tiep tu PaymentServiceImpl khi dat COD xong hoac co ket qua thanh toan VNPay.

    void notifyPaymentSuccess(Order order);

    void notifyPaymentFailed(Order order);

    void notifyOrderPlaced(Order order);

    // ===== Nhom 2: thong bao theo kien truc Spring Event (OrderEventListener goi) =====

    // Tao thong bao NEW_ORDER cho tat ca STAFF dang hoat dong khi co don hang moi
    void notifyStaffNewOrder(Long orderId, String orderCode);

    // Tao thong bao ORDER_UPDATE cho khach hang khi don hang cua ho doi trang thai
    void notifyCustomerOrderStatusChanged(Long orderId, String orderCode, Long customerId,
                                           OrderStatus oldStatus, OrderStatus newStatus);

    // ===== Nhom 3: API cho man hinh thong bao cua user (NotificationController goi) =====

    ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(Long userId, int page, int size);

    ApiResponse<Long> countUnread(Long userId);

    ApiResponse<Void> markAsRead(Long userId, Long notificationId);

    ApiResponse<Void> markAllAsRead(Long userId);
}
