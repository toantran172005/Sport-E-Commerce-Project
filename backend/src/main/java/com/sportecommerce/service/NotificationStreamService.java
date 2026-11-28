package com.sportecommerce.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Đẩy thông báo tức thì (Server-Sent Events) tới trình duyệt đang mở.
 * Chỉ đẩy tín hiệu nhẹ "có thông báo mới"; client tự tải danh sách qua REST (dữ liệu vẫn nằm trong DB).
 */
public interface NotificationStreamService {

    /**
     * Mở kết nối SSE cho user (gửi sẵn 1 sự kiện "connected").
     * backOffice = true với ADMIN/STAFF để nhận các tín hiệu làm mới dành cho màn quản trị.
     */
    SseEmitter subscribe(Long userId, boolean backOffice);

    /**
     * Báo cho các tab của user biết một nhóm dữ liệu (vd "orders") vừa thay đổi để tự tải lại.
     * Chỉ gửi tên nhóm, không gửi dữ liệu; gọi SAU khi transaction commit.
     */
    void publishRefresh(Long userId, String topic);

    /** Như publishRefresh nhưng gửi tới mọi ADMIN/STAFF đang mở trang. */
    void publishRefreshToBackOffice(String topic);

    /** Báo cho mọi tab đang mở của user biết có thông báo mới (gọi SAU khi transaction commit). */
    void publish(Long userId);

    /** Số kết nối đang mở (phục vụ giám sát). */
    int activeConnections();
}
