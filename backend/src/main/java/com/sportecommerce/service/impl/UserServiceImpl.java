package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.ChangeEmailRequest;
import com.sportecommerce.dto.request.ChangePasswordRequest;
import com.sportecommerce.dto.request.ChangePhoneRequest;
import com.sportecommerce.dto.request.ConfirmChangeEmailRequest;
import com.sportecommerce.dto.request.ConfirmChangePhoneRequest;
import com.sportecommerce.dto.request.UpdateProfileRequest;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.OtpPurpose;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.OtpService;
import com.sportecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Override
    public UserResponse getProfile(Long userId) {
        return UserResponse.fromEntity(getUserOrThrow(userId));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserOrThrow(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException("Mat khau hien tai khong dung", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void requestChangeEmail(Long userId, ChangeEmailRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getNewEmail().equalsIgnoreCase(user.getEmail())) {
            throw new AppException("Email moi phai khac email hien tai", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new AppException("Email nay da duoc su dung boi tai khoan khac", HttpStatus.CONFLICT);
        }

        // Gui OTP toi email MOI de xac nhan quyen so huu hop thu do truoc khi doi.
        otpService.generateAndSend(request.getNewEmail(), OtpPurpose.CHANGE_EMAIL);
    }

    @Override
    @Transactional
    public UserResponse confirmChangeEmail(Long userId, ConfirmChangeEmailRequest request) {
        User user = getUserOrThrow(userId);

        otpService.verify(request.getNewEmail(), OtpPurpose.CHANGE_EMAIL, request.getOtp());

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new AppException("Email nay da duoc su dung boi tai khoan khac", HttpStatus.CONFLICT);
        }

        user.setEmail(request.getNewEmail());
        user.setEmailVerifiedAt(OffsetDateTime.now());

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    public void requestChangePhone(Long userId, ChangePhoneRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getNewPhoneNumber().equals(user.getPhoneNumber())) {
            throw new AppException("So dien thoai moi phai khac so hien tai", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByPhoneNumber(request.getNewPhoneNumber())) {
            throw new AppException("So dien thoai nay da duoc su dung boi tai khoan khac", HttpStatus.CONFLICT);
        }

        // Chua tich hop SMS gateway: OTP xac nhan doi SDT duoc gui qua email da xac thuc cua chinh user.
        otpService.generateAndSend(user.getEmail(), OtpPurpose.CHANGE_PHONE);
    }

    @Override
    @Transactional
    public UserResponse confirmChangePhone(Long userId, ConfirmChangePhoneRequest request) {
        User user = getUserOrThrow(userId);

        otpService.verify(user.getEmail(), OtpPurpose.CHANGE_PHONE, request.getOtp());

        if (userRepository.existsByPhoneNumber(request.getNewPhoneNumber())) {
            throw new AppException("So dien thoai nay da duoc su dung boi tai khoan khac", HttpStatus.CONFLICT);
        }

        user.setPhoneNumber(request.getNewPhoneNumber());
        user.setPhoneVerifiedAt(OffsetDateTime.now());

        return UserResponse.fromEntity(userRepository.save(user));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung"));
    }
}
