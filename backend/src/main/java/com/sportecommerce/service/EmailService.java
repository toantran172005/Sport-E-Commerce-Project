package com.sportecommerce.service;

import com.sportecommerce.enums.OtpPurpose;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp, OtpPurpose purpose);
}
