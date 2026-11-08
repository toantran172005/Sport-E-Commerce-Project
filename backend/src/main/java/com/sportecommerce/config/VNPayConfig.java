package com.sportecommerce.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {

    @Value("${vnpay.tmn-code:DEMO_TMN}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:DEMO_SECRET_KEY_12345678901234567890123456789012}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:5173/payment-result}")
    private String returnUrl;

    private final String version = "2.1.0";
    private final String command = "pay";
    private final String currCode = "VND";
}
