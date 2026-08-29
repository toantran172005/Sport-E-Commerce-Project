package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.ForgotPasswordRequest;
import com.sportecommerce.dto.request.LoginRequest;
import com.sportecommerce.dto.request.RegisterRequest;
import com.sportecommerce.dto.request.ResendOtpRequest;
import com.sportecommerce.dto.request.ResetPasswordRequest;
import com.sportecommerce.dto.request.VerifyOtpRequest;
import com.sportecommerce.dto.response.AuthResponse;
import com.sportecommerce.dto.response.UserResponse;
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
import com.sportecommerce.service.OtpService;
import com.sportecommerce.util.HashUtil;
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

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email nay da duoc dang ky", HttpStatus.CONFLICT);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException("So dien thoai nay da duoc su dung", HttpStatus.CONFLICT);
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
            throw new AppException("Muc dich OTP khong hop le cho thao tac nay", HttpStatus.BAD_REQUEST);
        }

        User user = findActivatableUserByEmail(request.getEmail());

        otpService.verify(request.getEmail(), OtpPurpose.REGISTER, request.getOtp());

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        if (request.getPurpose() == OtpPurpose.REGISTER) {
            findActivatableUserByEmail(request.getEmail());
        }
        otpService.generateAndSend(request.getEmail(), request.getPurpose());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new AppException("Email hoac mat khau khong dung", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException("Email hoac mat khau khong dung", HttpStatus.UNAUTHORIZED);
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AppException("Tai khoan chua duoc xac thuc email, vui long xac thuc OTP truoc khi dang nhap", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new AppException("Tai khoan da bi khoa, vui long lien he ho tro", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.DELETED) {
            throw new AppException("Tai khoan khong con hoat dong", HttpStatus.FORBIDDEN);
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        String tokenHash = HashUtil.sha256(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException("Refresh token khong hop le", HttpStatus.UNAUTHORIZED));

        if (storedToken.getRevokedAt() != null) {
            throw new AppException("Refresh token da bi thu hoi, vui long dang nhap lai", HttpStatus.UNAUTHORIZED);
        }
        if (storedToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new AppException("Refresh token da het han, vui long dang nhap lai", HttpStatus.UNAUTHORIZED);
        }

        User user = storedToken.getUser();

        // Xoay vong: thu hoi token cu, phat token moi (phat hien duoc neu token bi danh cap va tai su dung).
        storedToken.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = HashUtil.sha256(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevokedAt(OffsetDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Khong tim thay nguoi dung", HttpStatus.NOT_FOUND));

        List<RefreshToken> activeTokens = refreshTokenRepository.findAllByUserAndRevokedAtIsNull(user);
        OffsetDateTime now = OffsetDateTime.now();
        activeTokens.forEach(token -> token.setRevokedAt(now));
        refreshTokenRepository.saveAll(activeTokens);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        // Khong tiet lo email co ton tai hay khong de tranh do tham do (user enumeration).
        userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .ifPresent(user -> otpService.generateAndSend(user.getEmail(), OtpPurpose.RESET_PASSWORD));
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new AppException("Yeu cau khong hop le", HttpStatus.BAD_REQUEST));

        otpService.verify(request.getEmail(), OtpPurpose.RESET_PASSWORD, request.getOtp());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        logoutAll(user.getId());
    }

    private User findActivatableUserByEmail(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new AppException("Khong tim thay tai khoan voi email nay", HttpStatus.NOT_FOUND));

        if (user.getStatus() != UserStatus.PENDING) {
            throw new AppException("Tai khoan da duoc xac thuc truoc do", HttpStatus.BAD_REQUEST);
        }
        return user;
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = OtpGenerator.generateOpaqueToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(HashUtil.sha256(rawRefreshToken))
                .expiresAt(OffsetDateTime.now().plus(Duration.ofMillis(refreshTokenExpirationMs)))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
