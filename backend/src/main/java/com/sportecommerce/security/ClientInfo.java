package com.sportecommerce.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Thông tin thiết bị gọi API hiện tại (IP + User-Agent), lấy từ request đang xử lý.
 * IP lấy từ X-Forwarded-For khi chạy sau nginx/proxy. Chỉ dùng để ghi nhận/cảnh báo, không dùng để chặn.
 */
public record ClientInfo(String ipAddress, String userAgent) {

    private static final int MAX_UA_LENGTH = 255;

    public static ClientInfo current() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            return from(servletAttrs.getRequest());
        }
        return new ClientInfo(null, null);
    }

    public static ClientInfo from(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        if (ip != null && ip.length() > 64) {
            ip = ip.substring(0, 64);
        }
        String ua = request.getHeader("User-Agent");
        if (ua != null && ua.length() > MAX_UA_LENGTH) {
            ua = ua.substring(0, MAX_UA_LENGTH);
        }
        return new ClientInfo(ip, ua);
    }
}
