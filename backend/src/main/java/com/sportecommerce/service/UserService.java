package com.sportecommerce.service;

import com.sportecommerce.dto.request.ChangeEmailRequest;
import com.sportecommerce.dto.request.ChangePasswordRequest;
import com.sportecommerce.dto.request.ChangePhoneRequest;
import com.sportecommerce.dto.request.ConfirmChangeEmailRequest;
import com.sportecommerce.dto.request.ConfirmChangePhoneRequest;
import com.sportecommerce.dto.request.UpdateProfileRequest;
import com.sportecommerce.dto.response.UserResponse;

public interface UserService {

    UserResponse getProfile(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void requestChangeEmail(Long userId, ChangeEmailRequest request);

    UserResponse confirmChangeEmail(Long userId, ConfirmChangeEmailRequest request);

    void requestChangePhone(Long userId, ChangePhoneRequest request);

    UserResponse confirmChangePhone(Long userId, ConfirmChangePhoneRequest request);
}
