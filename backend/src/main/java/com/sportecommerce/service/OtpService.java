package com.sportecommerce.service;

import com.sportecommerce.enums.OtpPurpose;

public interface OtpService {

    /**
     * Sinh OTP moi, luu vao Redis (co TTL) va gui qua email.
     * Nem AppException (429) neu dang trong thoi gian cooldown gui lai.
     */
    void generateAndSend(String email, OtpPurpose purpose);

    /**
     * Xac thuc OTP nguoi dung nhap. Neu dung se xoa OTP khoi Redis (dung 1 lan).
     * Neu sai se tang bo dem so lan sai; qua nguong se khoa xac thuc den khi OTP het han.
     */
    void verify(String email, OtpPurpose purpose, String otp);
}
