package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.ChangeEmailRequest;
import com.sportecommerce.dto.request.ChangePasswordRequest;
import com.sportecommerce.dto.request.ChangePhoneRequest;
import com.sportecommerce.dto.request.ConfirmChangeEmailRequest;
import com.sportecommerce.dto.request.ConfirmChangePhoneRequest;
import com.sportecommerce.dto.request.UpdateProfileRequest;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(userService.getProfile(principal.getId()));
    }

    @PutMapping
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success("Cap nhat ho so thanh cong", userService.updateProfile(principal.getId(), request));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(principal.getId(), request);
        return ApiResponse.success("Doi mat khau thanh cong", null);
    }

    @PostMapping("/change-email/request")
    public ApiResponse<Void> requestChangeEmail(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangeEmailRequest request
    ) {
        userService.requestChangeEmail(principal.getId(), request);
        return ApiResponse.success("Da gui ma OTP toi email moi", null);
    }

    @PostMapping("/change-email/confirm")
    public ApiResponse<UserResponse> confirmChangeEmail(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConfirmChangeEmailRequest request
    ) {
        return ApiResponse.success("Doi email thanh cong", userService.confirmChangeEmail(principal.getId(), request));
    }

    @PostMapping("/change-phone/request")
    public ApiResponse<Void> requestChangePhone(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePhoneRequest request
    ) {
        userService.requestChangePhone(principal.getId(), request);
        return ApiResponse.success("Da gui ma OTP xac nhan toi email cua ban", null);
    }

    @PostMapping("/change-phone/confirm")
    public ApiResponse<UserResponse> confirmChangePhone(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConfirmChangePhoneRequest request
    ) {
        return ApiResponse.success("Doi so dien thoai thanh cong", userService.confirmChangePhone(principal.getId(), request));
    }
}
