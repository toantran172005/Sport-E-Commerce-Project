package com.sportecommerce.event;

import com.sportecommerce.enums.OrderStatus;

/**
 * Event du kien duoc phat ra khi trang thai 1 don hang thay doi (vi du: admin
 * cap nhat trang thai don hang). Dung de bao cho khach hang biet don hang cua
 * ho vua duoc cap nhat.
 *
 * LUU Y: tai thoi diem tao module Notification nay, API cap nhat trang thai
 * don hang CHUA duoc xay dung (nam ngoai pham vi cong viec da thong nhat),
 * nen hien chua co noi nao trong code publish event nay. Khi API do duoc
 * xay dung, chi can inject ApplicationEventPublisher va publish event nay
 * sau khi luu trang thai moi thanh cong la NotificationEventListener se tu
 * dong xu ly phan gui thong bao.
 */
public record OrderStatusChangedEvent(
        Long orderId,
        String orderCode,
        Long customerId,
        OrderStatus oldStatus,
        OrderStatus newStatus
) {
}
