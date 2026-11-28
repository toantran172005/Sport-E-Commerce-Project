package com.sportecommerce.service.impl;

import com.sportecommerce.dto.response.SessionResponse;
import com.sportecommerce.entity.RefreshToken;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.RefreshTokenRepository;
import com.sportecommerce.security.ClientInfo;
import com.sportecommerce.security.JwtTokenProvider;
import com.sportecommerce.service.EmailService;
import com.sportecommerce.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Chính sách phiên theo vai trò (mặc định): CUSTOMER 5 thiết bị, STAFF 2, ADMIN 1.
 * Phiên bị đá/thu hồi: refresh token bị thu hồi ngay; access token cũ (tối đa vài phút) bị chặn
 * bằng danh sách session id trong Redis (JwtAuthenticationFilter kiểm tra cho ADMIN/STAFF).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {

    private static final String REVOKED_KEY_PREFIX = "auth:revoked-sid:";
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private final RefreshTokenRepository refreshTokenRepository;
    private final StringRedisTemplate redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Value("${app.session.max-customer:5}")
    private int maxCustomerSessions;

    @Value("${app.session.max-staff:2}")
    private int maxStaffSessions;

    @Value("${app.session.max-admin:1}")
    private int maxAdminSessions;

    private int maxSessionsFor(UserRole role) {
        int max = switch (role) {
            case ADMIN -> maxAdminSessions;
            case STAFF -> maxStaffSessions;
            default -> maxCustomerSessions;
        };
        return Math.max(1, max);
    }

    private List<RefreshToken> findActiveSessions(User user) {
        OffsetDateTime now = OffsetDateTime.now();
        return refreshTokenRepository.findAllByUserAndRevokedAtIsNull(user).stream()
                .filter(token -> token.getExpiresAt().isAfter(now))
                .toList();
    }

    @Override
    @Transactional
    public List<RefreshToken> enforceSessionLimit(User user) {
        int max = maxSessionsFor(user.getRole());
        List<RefreshToken> active = new ArrayList<>(findActiveSessions(user));
        active.sort(Comparator.comparing(RefreshToken::getCreatedAt));

        List<RefreshToken> displaced = new ArrayList<>();
        // Cần chừa chỗ cho phiên sắp tạo: số phiên hiện có phải < max
        while (active.size() >= max) {
            RefreshToken oldest = active.remove(0);
            revoke(oldest);
            displaced.add(oldest);
        }
        return displaced;
    }

    @Override
    @Transactional
    public void revoke(RefreshToken token) {
        if (token.getRevokedAt() == null) {
            token.setRevokedAt(OffsetDateTime.now());
            refreshTokenRepository.save(token);
        }
        markSessionRevoked(token.getId());
    }

    @Override
    @Transactional
    public int revokeAll(User user, Long exceptSessionId) {
        List<RefreshToken> active = refreshTokenRepository.findAllByUserAndRevokedAtIsNull(user);
        int count = 0;
        for (RefreshToken token : active) {
            if (exceptSessionId != null && exceptSessionId.equals(token.getId())) {
                continue;
            }
            revoke(token);
            count++;
        }
        return count;
    }

    private void markSessionRevoked(Long sessionId) {
        if (sessionId == null) {
            return;
        }
        try {
            // TTL = thời gian sống tối đa của access token (+ dư 1 phút): hết hạn là tự dọn
            Duration ttl = Duration.ofMillis(jwtTokenProvider.getAccessTokenExpirationMs()).plusMinutes(1);
            redisTemplate.opsForValue().set(REVOKED_KEY_PREFIX + sessionId, "1", ttl);
        } catch (Exception ex) {
            log.warn("Không ghi được session bị thu hồi vào Redis (sid={}): {}", sessionId, ex.getMessage());
        }
    }

    @Override
    public boolean isRevoked(Long sessionId) {
        if (sessionId == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(REVOKED_KEY_PREFIX + sessionId));
        } catch (Exception ex) {
            // Fail-open: Redis lỗi thì không chặn người dùng (refresh token vẫn đã bị thu hồi ở DB)
            log.warn("Không kiểm tra được session bị thu hồi trong Redis (sid={}): {}", sessionId, ex.getMessage());
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> listSessions(User user, Long currentSessionId) {
        return findActiveSessions(user).stream()
                .sorted(Comparator.comparing(
                        (RefreshToken t) -> t.getLastUsedAt() != null ? t.getLastUsedAt() : t.getCreatedAt()).reversed())
                .map(token -> SessionResponse.builder()
                        .id(token.getId())
                        .deviceName(describeDevice(token.getUserAgent()))
                        .ipAddress(token.getIpAddress())
                        .createdAt(token.getCreatedAt())
                        .lastUsedAt(token.getLastUsedAt() != null ? token.getLastUsedAt() : token.getCreatedAt())
                        .current(currentSessionId != null && currentSessionId.equals(token.getId()))
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void revokeSession(User user, Long sessionId) {
        RefreshToken target = findActiveSessions(user).stream()
                .filter(token -> token.getId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy phiên đăng nhập", HttpStatus.NOT_FOUND));
        revoke(target);
    }

    @Override
    public Long currentSessionId() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            String header = servletAttrs.getRequest().getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    return jwtTokenProvider.getSessionId(header.substring(7));
                } catch (Exception ex) {
                    return null;
                }
            }
        }
        return null;
    }

    @Override
    public void alertAdminLogin(User admin, ClientInfo client, boolean displacedOtherSession) {
        emailService.sendLoginAlertEmail(
                admin.getEmail(),
                admin.getFullName(),
                client.ipAddress() != null ? client.ipAddress() : "không xác định",
                describeDevice(client.userAgent()),
                TIME_FORMAT.format(OffsetDateTime.now()),
                displacedOtherSession);
    }

    /** Mô tả ngắn thiết bị từ User-Agent, ví dụ "Chrome trên Windows". */
    static String describeDevice(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Thiết bị không xác định";
        }
        String ua = userAgent.toLowerCase();

        String browser;
        if (ua.contains("edg/")) {
            browser = "Edge";
        } else if (ua.contains("opr/") || ua.contains("opera")) {
            browser = "Opera";
        } else if (ua.contains("firefox")) {
            browser = "Firefox";
        } else if (ua.contains("chrome") || ua.contains("crios")) {
            browser = "Chrome";
        } else if (ua.contains("safari")) {
            browser = "Safari";
        } else if (ua.contains("postman")) {
            browser = "Postman";
        } else if (ua.contains("curl")) {
            browser = "curl";
        } else {
            browser = "Trình duyệt khác";
        }

        String os;
        if (ua.contains("iphone") || ua.contains("ipad")) {
            os = "iOS";
        } else if (ua.contains("android")) {
            os = "Android";
        } else if (ua.contains("windows")) {
            os = "Windows";
        } else if (ua.contains("mac os") || ua.contains("macintosh")) {
            os = "macOS";
        } else if (ua.contains("linux")) {
            os = "Linux";
        } else {
            os = null;
        }
        return os != null ? browser + " trên " + os : browser;
    }
}
