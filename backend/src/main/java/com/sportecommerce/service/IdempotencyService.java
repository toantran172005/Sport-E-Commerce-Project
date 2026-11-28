package com.sportecommerce.service;

/**
 * Chống xử lý trùng một thao tác ghi (đặt hàng) khi khách bấm 2 lần / mạng chậm khiến client gửi lại.
 * Client gửi header Idempotency-Key (UUID mới cho mỗi lần thanh toán); cùng khóa chỉ tạo 1 đơn.
 */
public interface IdempotencyService {

    enum State {
        /** Khóa mới, được phép xử lý. */
        ACQUIRED,
        /** Một request cùng khóa đang xử lý dở. */
        IN_PROGRESS,
        /** Đã xử lý xong trước đó; {@link Result#value()} là id đơn đã tạo. */
        COMPLETED,
        /** Không dùng được kho khóa (Redis lỗi) -> cứ xử lý như bình thường. */
        UNAVAILABLE
    }

    record Result(State state, String value) {
    }

    Result begin(Long userId, String key);

    void complete(Long userId, String key, Long orderId);

    /** Xử lý thất bại: nhả khóa để client được phép thử lại với cùng khóa. */
    void release(Long userId, String key);
}
