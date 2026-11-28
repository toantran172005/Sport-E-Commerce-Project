package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreateStaffRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.StaffAccountResponse;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Quan ly tai khoan nguoi dung - CHI ADMIN (STAFF va CUSTOMER bi tu choi 403).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<StaffAccountResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest request) {
        StaffAccountResponse response = adminUserService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản nhân viên thành công", response));
    }

    // Khoa tai khoan nhan vien (TC-M4-20)
    @PatchMapping("/{id}/lock")
    public ApiResponse<UserResponse> lockStaff(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ApiResponse.success("Đã khóa tài khoản nhân viên",
                adminUserService.lockStaff(principal.getId(), id));
    }

    // Mo khoa tai khoan nhan vien
    @PatchMapping("/{id}/unlock")
    public ApiResponse<UserResponse> unlockStaff(@PathVariable Long id) {
        return ApiResponse.success("Đã mở khóa tài khoản nhân viên", adminUserService.unlockStaff(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(adminUserService.getUsers(role, keyword, page, size));
    }
}
