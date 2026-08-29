package com.sportecommerce.service;

import com.sportecommerce.dto.request.ForgotPasswordRequest;
import com.sportecommerce.dto.request.LoginRequest;
import com.sportecommerce.dto.request.RegisterRequest;
import com.sportecommerce.dto.request.ResendOtpRequest;
import com.sportecommerce.dto.request.ResetPasswordRequest;
import com.sportecommerce.dto.request.VerifyOtpRequest;
import com.sportecommerce.dto.response.AuthResponse;

public interface AuthService {

    void register(RegisterRequest request);

    AuthResponse verifyRegisterOtp(VerifyOtpRequest request);

    void resendOtp(ResendOtpRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String rawRefreshToken);

    void logout(String rawRefreshToken);

    void logoutAll(Long userId);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
