package com.sportecommerce.service;

import com.sportecommerce.enums.OtpPurpose;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp, OtpPurpose purpose);

    /** Email cảnh báo có đăng nhập mới vào tài khoản (không ném lỗi nếu gửi thất bại). */
    void sendLoginAlertEmail(String toEmail, String fullName, String ipAddress, String deviceName,
                             String time, boolean displacedOtherSession);
}
