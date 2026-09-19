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
            throw new IllegalStateException("Không thể gửi email OTP, vui lòng thử lại sau.", e);
        }
    }

    private String subjectFor(OtpPurpose purpose) {
        return switch (purpose) {
            case REGISTER -> "Xác nhận đăng ký tài khoản - Ways Sport";
            case RESET_PASSWORD -> "Mã OTP khôi phục mật khẩu - Ways Sport";
            case CHANGE_EMAIL -> "Xác nhận đổi email - Ways Sport";
            case CHANGE_PHONE -> "Xác nhận đổi số điện thoại - Ways Sport";
        };
    }

    private String buildBody(String otp) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color:#1a73e8;">Sport E-Commerce</h2>
                    <p>Ma xac thuc (OTP) cua ban la:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">%s</p>
                    <p>Mã này sẽ hết hạn sau 15 phút. Vui lòng không chia sẻ mã này với bất kì ai!.</p>
                    <p style="color:#888; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                </div>
                """.formatted(otp);
    }
}
