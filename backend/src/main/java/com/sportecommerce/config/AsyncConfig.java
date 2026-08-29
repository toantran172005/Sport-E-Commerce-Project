package com.sportecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Bat @Async de gui email OTP khong lam block request cua API.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
