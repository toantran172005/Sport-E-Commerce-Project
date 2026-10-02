package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.NotificationResponse;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // Danh sach thong bao cua user dang dang nhap, moi nhat truoc, co phan trang
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = userPrincipal.getId();
        ApiResponse<PageResponse<NotificationResponse>> response =
                notificationService.getMyNotifications(userId, page, size);

        return ResponseEntity.ok(response);
    }

    // So luong thong bao chua doc, dung de hien badge tren giao dien
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> countUnread(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getId();
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    // Danh dau 1 thong bao la da doc
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        Long userId = userPrincipal.getId();
        return ResponseEntity.ok(notificationService.markAsRead(userId, id));
    }

    // Danh dau tat ca thong bao cua user hien tai la da doc
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getId();
        return ResponseEntity.ok(notificationService.markAllAsRead(userId));
    }
}
