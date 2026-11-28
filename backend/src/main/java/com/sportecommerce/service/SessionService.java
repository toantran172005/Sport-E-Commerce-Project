package com.sportecommerce.service;

import com.sportecommerce.dto.response.SessionResponse;
import com.sportecommerce.entity.RefreshToken;
import com.sportecommerce.entity.User;
import com.sportecommerce.security.ClientInfo;

import java.util.List;

/**
 * Quản lý phiên đăng nhập theo vai trò: giới hạn số thiết bị, đá phiên cũ, thu hồi, cảnh báo.
 */
public interface SessionService {

    /**
     * Đảm bảo user còn chỗ cho 1 phiên mới: thu hồi (đá) các phiên cũ nhất nếu đã đạt giới hạn của vai trò.
     * Trả về các phiên bị đá.
     */
    List<RefreshToken> enforceSessionLimit(User user);

    /** Thu hồi 1 phiên và đưa session id vào danh sách chặn (Redis) để access token cũ mất hiệu lực ngay. */
    void revoke(RefreshToken token);

    /** Thu hồi mọi phiên của user, trừ phiên {@code exceptSessionId} (null = thu hồi tất cả). Trả về số phiên đã thu hồi. */
    int revokeAll(User user, Long exceptSessionId);

    /** Session id có bị thu hồi chưa. Lỗi Redis thì coi như chưa (fail-open) và ghi log. */
    boolean isRevoked(Long sessionId);

    List<SessionResponse> listSessions(User user, Long currentSessionId);

    /** Thu hồi 1 phiên của chính user; không thuộc user hoặc không còn hoạt động thì báo 404. */
    void revokeSession(User user, Long sessionId);

    /** Session id của request hiện tại (từ claim sid trong access token), null nếu không có. */
    Long currentSessionId();

    /** Gửi email cảnh báo khi tài khoản ADMIN có đăng nhập mới. */
    void alertAdminLogin(User admin, ClientInfo client, boolean displacedOtherSession);
}
