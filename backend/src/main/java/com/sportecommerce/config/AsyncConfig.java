package com.sportecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Bat @Async de gui email OTP khong lam block request cua API.
 * Bat @Scheduled cho cac job nen (huy don qua han thanh toan, heartbeat SSE...).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
