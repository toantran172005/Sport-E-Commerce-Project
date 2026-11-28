package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.SessionResponse;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Thiết bị đang đăng nhập của chính người dùng: xem danh sách, đăng xuất 1 thiết bị, đăng xuất các thiết bị khác.
 * (/api/users/** yêu cầu đăng nhập - SecurityConfig.)
 */
@RestController
@RequestMapping("/api/users/me/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ApiResponse<List<SessionResponse>> listSessions(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(sessionService.listSessions(principal.getUser(), sessionService.currentSessionId()));
    }

    @DeleteMapping("/{sessionId}")
    public ApiResponse<Void> revokeSession(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long sessionId) {
        sessionService.revokeSession(principal.getUser(), sessionId);
        return ApiResponse.success("Đã đăng xuất thiết bị", null);
    }

    @PostMapping("/revoke-others")
    public ApiResponse<Map<String, Integer>> revokeOtherSessions(@AuthenticationPrincipal UserPrincipal principal) {
        Long currentSessionId = sessionService.currentSessionId();
        if (currentSessionId == null) {
            // Access token cũ (phát trước khi có claim sid) không xác định được phiên hiện tại -> tránh đăng xuất luôn phiên này
            throw new AppException("Vui lòng đăng nhập lại để dùng tính năng này", HttpStatus.BAD_REQUEST);
        }
        int count = sessionService.revokeAll(principal.getUser(), currentSessionId);
        return ApiResponse.success("Đã đăng xuất các thiết bị khác", Map.of("revoked", count));
    }
}
