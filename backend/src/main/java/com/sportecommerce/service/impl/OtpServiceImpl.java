package com.sportecommerce.service.impl;

import com.sportecommerce.enums.OtpPurpose;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.service.EmailService;
import com.sportecommerce.service.OtpService;
import com.sportecommerce.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.ttl-seconds:120}")
    private long otpTtlSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Override
    public void generateAndSend(String email, OtpPurpose purpose) {
        String cooldownKey = cooldownKey(email, purpose);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            Long remaining = redisTemplate.getExpire(cooldownKey);
            long seconds = (remaining == null) ? resendCooldownSeconds : remaining;
            throw new AppException(
                    "Vui long doi " + seconds + " giay truoc khi yeu cau gui lai OTP",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        String otp = OtpGenerator.generateNumeric(otpLength);

        String otpKey = otpKey(email, purpose);
        String attemptKey = attemptKey(email, purpose);

        redisTemplate.opsForValue().set(otpKey, otp, Duration.ofSeconds(otpTtlSeconds));
        redisTemplate.delete(attemptKey);
        redisTemplate.opsForValue().set(cooldownKey, "1", Duration.ofSeconds(resendCooldownSeconds));

        emailService.sendOtpEmail(email, otp, purpose);
    }

    @Override
    public void verify(String email, OtpPurpose purpose, String otp) {
        String otpKey = otpKey(email, purpose);
        String attemptKey = attemptKey(email, purpose);

        String storedOtp = redisTemplate.opsForValue().get(otpKey);

        if (storedOtp == null) {
            throw new AppException("Ma OTP khong ton tai hoac da het han, vui long yeu cau gui lai", HttpStatus.BAD_REQUEST);
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptKey);
        if (attempts != null && attempts == 1L) {
            Long ttl = redisTemplate.getExpire(otpKey);
            if (ttl != null && ttl > 0) {
                redisTemplate.expire(attemptKey, Duration.ofSeconds(ttl));
            }
        }

        if (attempts != null && attempts > maxAttempts) {
            redisTemplate.delete(otpKey);
            throw new AppException("Ban da nhap sai OTP qua so lan cho phep, vui long yeu cau gui ma moi", HttpStatus.TOO_MANY_REQUESTS);
        }

        if (!storedOtp.equals(otp)) {
            throw new AppException("Ma OTP khong chinh xac", HttpStatus.BAD_REQUEST);
        }

        redisTemplate.delete(otpKey);
        redisTemplate.delete(attemptKey);
    }

    private String otpKey(String email, OtpPurpose purpose) {
        return "otp:%s:%s".formatted(purpose.name(), email.toLowerCase());
    }

    private String attemptKey(String email, OtpPurpose purpose) {
        return "otp:attempt:%s:%s".formatted(purpose.name(), email.toLowerCase());
    }

    private String cooldownKey(String email, OtpPurpose purpose) {
        return "otp:cooldown:%s:%s".formatted(purpose.name(), email.toLowerCase());
    }
}
