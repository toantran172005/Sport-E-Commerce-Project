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
import com.sportecommerce.service.FileStorageService;
import com.sportecommerce.service.OtpService;
import com.sportecommerce.service.UserService;
import com.sportecommerce.util.AvatarImageProcessor;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final MapperUtil mapperUtil;
    private final FileStorageService fileStorageService;

    @Override
    public UserResponse getProfile(Long userId) {
        return mapperUtil.mapToUserResponse(getUserOrThrow(userId));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        return mapperUtil.mapToUserResponse(userRepository.save(user));
    }

    /**
     * Không đánh dấu @Transactional: lời gọi mạng lên dịch vụ lưu trữ không nên giữ kết nối DB.
     * userId luôn lấy từ JWT, mỗi user chỉ có một ảnh (public id cố định nên ảnh mới ghi đè ảnh cũ).
     */
    @Override
    public UserResponse updateAvatar(Long userId, MultipartFile file) {
        User user = getUserOrThrow(userId);

        if (file == null || file.isEmpty()) {
            throw new AppException("Vui lòng chọn ảnh đại diện", HttpStatus.BAD_REQUEST);
        }

        byte[] processed;
        try {
            processed = AvatarImageProcessor.toSquareJpeg(file.getBytes());
        } catch (IllegalArgumentException e) {
            throw new AppException(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            throw new AppException("Không đọc được tệp ảnh tải lên", HttpStatus.BAD_REQUEST);
        }

        FileStorageService.StoredFile stored = fileStorageService.uploadImage(processed, avatarPublicId(userId));
        user.setAvatarUrl(stored.url());
        return mapperUtil.mapToUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse removeAvatar(Long userId) {
        User user = getUserOrThrow(userId);

        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteImage(avatarPublicId(userId));
            user.setAvatarUrl(null);
            user = userRepository.save(user);
        }
        return mapperUtil.mapToUserResponse(user);
    }

    private static String avatarPublicId(Long userId) {
        return "avatars/user-" + userId;
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserOrThrow(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException("Mật khẩu hiện tại không đúng", HttpStatus.BAD_REQUEST);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new AppException("Mật khẩu mới phải khác mật khẩu hiện tại", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        // Da doi mat khau -> go co bat buoc doi mat khau mac dinh (tai khoan do Admin tao)
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    @Override
    public void requestChangeEmail(Long userId, ChangeEmailRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getNewEmail().equalsIgnoreCase(user.getEmail())) {
            throw new AppException("Email mới phải khác email hiện tại", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new AppException("Email này đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
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
            throw new AppException("Email này đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
        }

        user.setEmail(request.getNewEmail());
        user.setEmailVerifiedAt(OffsetDateTime.now());

        return mapperUtil.mapToUserResponse(userRepository.save(user));
    }

    @Override
    public void requestChangePhone(Long userId, ChangePhoneRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getNewPhoneNumber().equals(user.getPhoneNumber())) {
            throw new AppException("Số điện thoại mới phải khác số hiện tại", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByPhoneNumber(request.getNewPhoneNumber())) {
            throw new AppException("Số điện thoại này đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
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
            throw new AppException("Số điện thoại này đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
        }

        user.setPhoneNumber(request.getNewPhoneNumber());
        user.setPhoneVerifiedAt(OffsetDateTime.now());

        return mapperUtil.mapToUserResponse(userRepository.save(user));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }
}
