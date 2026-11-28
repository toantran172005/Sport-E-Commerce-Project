package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.ForgotPasswordRequest;
import com.sportecommerce.dto.request.LoginRequest;
import com.sportecommerce.dto.request.RegisterRequest;
import com.sportecommerce.dto.request.ResendOtpRequest;
import com.sportecommerce.dto.request.ResetPasswordRequest;
import com.sportecommerce.dto.request.VerifyOtpRequest;
import com.sportecommerce.dto.response.AuthResponse;
import com.sportecommerce.entity.RefreshToken;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.OtpPurpose;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.enums.UserStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.RefreshTokenRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.security.JwtTokenProvider;
import com.sportecommerce.service.AuthService;
import com.sportecommerce.security.ClientInfo;
import com.sportecommerce.security.CustomUserDetailsService;
import com.sportecommerce.service.OtpService;
import com.sportecommerce.service.SessionService;
import com.sportecommerce.util.HashUtil;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtTokenProvider jwtTokenProvider;
    private final MapperUtil mapperUtil;
    private final SessionService sessionService;
    private final CustomUserDetailsService userDetailsService;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new AppException("Email này đã được đăng ký", HttpStatus.CONFLICT);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException("Số điện thoại này đã được sử dụng", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(blankToNull(request.getPhoneNumber()))
                .role(UserRole.CUSTOMER)
                .status(UserStatus.PENDING)
                .build();

        userRepository.save(user);

        otpService.generateAndSend(user.getEmail(), OtpPurpose.REGISTER);
    }

    @Override
    @Transactional
    public AuthResponse verifyRegisterOtp(VerifyOtpRequest request) {
        if (request.getPurpose() != OtpPurpose.REGISTER) {
            throw new AppException("Mục đích OTP không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST);
        }

        User user = findActivatableUserByEmail(request.getEmail());

        otpService.verify(request.getEmail(), OtpPurpose.REGISTER, request.getOtp());

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, true);
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        if (request.getPurpose() == OtpPurpose.REGISTER) {
            User user = findActivatableUserByEmail(request.getEmail());
            otpService.generateAndSend(user.getEmail(), OtpPurpose.REGISTER);
        } else if (request.getPurpose() == OtpPurpose.RESET_PASSWORD) {
            userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.getEmail())
                    .ifPresent(user -> otpService.generateAndSend(user.getEmail(), OtpPurpose.RESET_PASSWORD));
        } else {
            throw new AppException("Mục đích OTP không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new AppException("Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException("Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED);
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AppException("Tài khoản chưa được xác thực email, vui lòng xác thực OTP trước khi đăng nhập", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new AppException("Tài khoản đã bị khóa, vui lòng liên hệ hỗ trợ", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.DELETED) {
            throw new AppException("Tài khoản không còn hoạt động", HttpStatus.FORBIDDEN);
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, true);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        String tokenHash = HashUtil.sha256(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException("Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED));

        if (storedToken.getRevokedAt() != null) {
            throw new AppException("Refresh token đã bị thu hồi, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED);
        }
        if (storedToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new AppException("Refresh token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED);
        }

        User user = storedToken.getUser();
        if (user.getDeletedAt() != null
                || user.getStatus() == UserStatus.LOCKED
                || user.getStatus() == UserStatus.DELETED) {
            storedToken.setRevokedAt(OffsetDateTime.now());
            refreshTokenRepository.save(storedToken);
            throw new AppException("Tài khoản đã bị khóa hoặc không còn tồn tại", HttpStatus.UNAUTHORIZED);
        }

        storedToken.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user, false);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = HashUtil.sha256(rawRefreshToken);
        // Thu hồi qua SessionService để access token của phiên này cũng mất hiệu lực ngay (ADMIN/STAFF)
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(sessionService::revoke);
    }

    @Override
    @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        sessionService.revokeAll(user, null);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.getEmail())
                .ifPresent(user -> {
                    try {
                        otpService.generateAndSend(user.getEmail(), OtpPurpose.RESET_PASSWORD);
                    } catch (AppException ex) {
                        if (ex.getStatus() != HttpStatus.TOO_MANY_REQUESTS) {
                            throw ex;
                        }
                    }
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new AppException("Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST));

        otpService.verify(request.getEmail(), OtpPurpose.RESET_PASSWORD, request.getOtp());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        logoutAll(user.getId());
        userDetailsService.evictUser(user.getId());
    }

    private User findActivatableUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản với email này", HttpStatus.NOT_FOUND));

        if (user.getStatus() != UserStatus.PENDING) {
            throw new AppException("Tài khoản đã được xác thực trước đó", HttpStatus.BAD_REQUEST);
        }
        return user;
    }

    /**
     * Phát cặp token mới cho 1 phiên. Trước khi tạo, áp chính sách số phiên theo vai trò
     * (CUSTOMER 5 / STAFF 2 / ADMIN 1): phiên cũ nhất bị đá nếu đã đầy.
     *
     * @param newLogin true khi đăng nhập/xác thực mới; false khi chỉ xoay vòng refresh token
     */
    private AuthResponse buildAuthResponse(User user, boolean newLogin) {
        ClientInfo client = ClientInfo.current();
        List<RefreshToken> displaced = sessionService.enforceSessionLimit(user);

        String rawRefreshToken = OtpGenerator.generateOpaqueToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(HashUtil.sha256(rawRefreshToken))
                .expiresAt(OffsetDateTime.now().plus(Duration.ofMillis(refreshTokenExpirationMs)))
                .ipAddress(client.ipAddress())
                .userAgent(client.userAgent())
                .lastUsedAt(OffsetDateTime.now())
                .build();
        refreshTokenRepository.save(refreshToken);

        // sid = id phiên (refresh token) -> cho phép đá phiên ngay lập tức
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(), user.getFullName(), refreshToken.getId());

        if (newLogin && user.getRole() == UserRole.ADMIN) {
            sessionService.alertAdminLogin(user, client, !displaced.isEmpty());
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapperUtil.mapToUserResponse(user))
                .build();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
