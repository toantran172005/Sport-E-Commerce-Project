package com.sportecommerce.service.impl;

import com.sportecommerce.entity.Notification;
import com.sportecommerce.entity.Order;
import com.sportecommerce.enums.NotificationType;
import com.sportecommerce.repository.NotificationRepository;
import com.sportecommerce.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void notifyPaymentSuccess(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Thanh toán thành công")
                .content(String.format("Đơn hàng %s đã được thanh toán thành công với tổng số tiền %,.0f đ.",
                        order.getOrderCode(), order.getTotalAmount()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "PAID"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Đã tạo thông báo thanh toán thành công cho đơn hàng: {}", order.getOrderCode());
    }

    @Override
    @Transactional
    public void notifyPaymentFailed(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Thanh toán thất bại")
                .content(String.format("Giao dịch thanh toán cho đơn hàng %s không thành công. Bạn có thể thử lại.",
                        order.getOrderCode()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "FAILED"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.warn("Đã tạo thông báo thanh toán thất bại cho đơn hàng: {}", order.getOrderCode());
    }

    @Override
    @Transactional
    public void notifyOrderPlaced(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Đặt hàng thành công")
                .content(String.format("Đơn hàng %s của bạn đã được xác nhận (COD). Bạn sẽ thanh toán khi nhận hàng.",
                        order.getOrderCode()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "CONFIRMED"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Đã tạo thông báo đặt hàng thành công cho đơn hàng: {}", order.getOrderCode());
    }
}
