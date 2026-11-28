package com.sportecommerce.service.impl;

import com.sportecommerce.service.IdempotencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyServiceImpl implements IdempotencyService {

    private static final String PREFIX = "idem:order:";
    private static final String PROCESSING = "PROCESSING";
    private static final Duration TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;

    private String redisKey(Long userId, String key) {
        return PREFIX + userId + ":" + key;
    }

    @Override
    public Result begin(Long userId, String key) {
        try {
            String redisKey = redisKey(userId, key);
            if (Boolean.TRUE.equals(redisTemplate.opsForValue().setIfAbsent(redisKey, PROCESSING, TTL))) {
                return new Result(State.ACQUIRED, null);
            }
            String current = redisTemplate.opsForValue().get(redisKey);
            if (current == null) {
                // Khóa vừa hết hạn / vừa được nhả giữa 2 lệnh: thử giành lại một lần
                if (Boolean.TRUE.equals(redisTemplate.opsForValue().setIfAbsent(redisKey, PROCESSING, TTL))) {
                    return new Result(State.ACQUIRED, null);
                }
                return new Result(State.IN_PROGRESS, null);
            }
            if (PROCESSING.equals(current)) {
                return new Result(State.IN_PROGRESS, null);
            }
            return new Result(State.COMPLETED, current);
        } catch (Exception ex) {
            // Fail-open: Redis lỗi thì vẫn cho đặt hàng (mất khả năng chống trùng chứ không chặn bán hàng)
            log.warn("Không dùng được Redis cho idempotency: {}", ex.getMessage());
            return new Result(State.UNAVAILABLE, null);
        }
    }

    @Override
    public void complete(Long userId, String key, Long orderId) {
        try {
            redisTemplate.opsForValue().set(redisKey(userId, key), String.valueOf(orderId), TTL);
        } catch (Exception ex) {
            log.warn("Không lưu được kết quả idempotency: {}", ex.getMessage());
        }
    }

    @Override
    public void release(Long userId, String key) {
        try {
            redisTemplate.delete(redisKey(userId, key));
        } catch (Exception ex) {
            log.warn("Không nhả được khóa idempotency: {}", ex.getMessage());
        }
    }
}
