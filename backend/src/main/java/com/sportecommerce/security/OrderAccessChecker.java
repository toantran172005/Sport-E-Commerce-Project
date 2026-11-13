package com.sportecommerce.security;

import com.sportecommerce.entity.Order;
import com.sportecommerce.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Kiểm tra quyền truy cập đơn hàng: chủ đơn hoặc STAFF/ADMIN mới được xem/thanh toán.
 * Dùng chung cho Order và Payment để tránh lộ đơn của người khác khi đoán id.
 */
@Component
public class OrderAccessChecker {

    public void assertCanAccess(Order order, UserPrincipal principal) {
        if (principal == null) {
            throw new AppException("Bạn cần đăng nhập để thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        if (principal.isStaff()) {
            return;
        }
        if (order.getUser() == null || !order.getUser().getId().equals(principal.getId())) {
            throw new AppException("Bạn không có quyền truy cập đơn hàng này", HttpStatus.FORBIDDEN);
        }
    }
}
