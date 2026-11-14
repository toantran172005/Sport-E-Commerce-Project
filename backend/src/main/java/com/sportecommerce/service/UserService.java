package com.sportecommerce.service;

import com.sportecommerce.dto.request.ChangeEmailRequest;
import com.sportecommerce.dto.request.ChangePasswordRequest;
import com.sportecommerce.dto.request.ChangePhoneRequest;
import com.sportecommerce.dto.request.ConfirmChangeEmailRequest;
import com.sportecommerce.dto.request.ConfirmChangePhoneRequest;
import com.sportecommerce.dto.request.UpdateProfileRequest;
import com.sportecommerce.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserResponse getProfile(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    /** Đổi ảnh đại diện: kiểm tra + chuẩn hóa ảnh, lưu lên dịch vụ lưu trữ, cập nhật avatar_url. */
    UserResponse updateAvatar(Long userId, MultipartFile file);

    /** Gỡ ảnh đại diện (về avatar chữ cái đầu). */
    UserResponse removeAvatar(Long userId);

    void changePassword(Long userId, ChangePasswordRequest request);

    void requestChangeEmail(Long userId, ChangeEmailRequest request);

    UserResponse confirmChangeEmail(Long userId, ConfirmChangeEmailRequest request);

    void requestChangePhone(Long userId, ChangePhoneRequest request);

    UserResponse confirmChangePhone(Long userId, ConfirmChangePhoneRequest request);
}
