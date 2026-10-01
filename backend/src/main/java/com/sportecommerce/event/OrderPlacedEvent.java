package com.sportecommerce.event;

/**
 * Event duoc phat ra ngay sau khi 1 don hang duoc dat thanh cong (placeOrder).
 * Dung de bao cho staff biet co don hang moi can xu ly, ma khong lam
 * OrderServiceImpl phai phu thuoc truc tiep vao NotificationService.
 */
public record OrderPlacedEvent(Long orderId, String orderCode, Long customerId) {
}
