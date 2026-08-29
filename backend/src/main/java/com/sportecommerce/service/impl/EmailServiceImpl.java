package com.sportecommerce.service.impl;

import com.sportecommerce.enums.OtpPurpose;
import com.sportecommerce.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String otp, OtpPurpose purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subjectFor(purpose));
            helper.setText(buildBody(otp), true);

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Gui email OTP that bai toi {}: {}", toEmail, e.getMessage());
            throw new IllegalStateException("Khong the gui email OTP, vui long thu lai sau", e);
        }
    }

    private String subjectFor(OtpPurpose purpose) {
        return switch (purpose) {
            case REGISTER -> "Xac nhan dang ky tai khoan - Sport E-Commerce";
            case RESET_PASSWORD -> "Ma OTP khoi phuc mat khau - Sport E-Commerce";
            case CHANGE_EMAIL -> "Xac nhan doi email - Sport E-Commerce";
            case CHANGE_PHONE -> "Xac nhan doi so dien thoai - Sport E-Commerce";
        };
    }

    private String buildBody(String otp) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color:#1a73e8;">Sport E-Commerce</h2>
                    <p>Ma xac thuc (OTP) cua ban la:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">%s</p>
                    <p>Ma nay se het han sau 2 phut. Vui long khong chia se ma nay cho bat ky ai.</p>
                    <p style="color:#888; font-size: 12px;">Neu ban khong thuc hien yeu cau nay, vui long bo qua email nay.</p>
                </div>
                """.formatted(otp);
    }
}
