package com.sportecommerce;

import com.sportecommerce.service.IdempotencyService;
import com.sportecommerce.service.impl.IdempotencyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/** Kiem thu chong dat hang trung (Idempotency-Key). */
@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOps;

    private IdempotencyServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new IdempotencyServiceImpl(redisTemplate);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    @DisplayName("Khoa moi -> ACQUIRED")
    void newKeyIsAcquired() {
        when(valueOps.setIfAbsent(eq("idem:order:1:key-1"), eq("PROCESSING"), any(Duration.class))).thenReturn(true);

        assertEquals(IdempotencyService.State.ACQUIRED, service.begin(1L, "key-1").state());
    }

    @Test
    @DisplayName("Khoa dang xu ly -> IN_PROGRESS (client nhan 409)")
    void processingKeyIsInProgress() {
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);
        when(valueOps.get("idem:order:1:key-1")).thenReturn("PROCESSING");

        assertEquals(IdempotencyService.State.IN_PROGRESS, service.begin(1L, "key-1").state());
    }

    @Test
    @DisplayName("Khoa da xong -> COMPLETED kem id don da tao")
    void completedKeyReturnsOrderId() {
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);
        when(valueOps.get("idem:order:1:key-1")).thenReturn("77");

        IdempotencyService.Result result = service.begin(1L, "key-1");

        assertEquals(IdempotencyService.State.COMPLETED, result.state());
        assertEquals("77", result.value());
    }

    @Test
    @DisplayName("Redis loi -> UNAVAILABLE (van cho dat hang)")
    void redisFailureFailsOpen() {
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class)))
                .thenThrow(new RuntimeException("redis down"));

        assertEquals(IdempotencyService.State.UNAVAILABLE, service.begin(1L, "key-1").state());
    }
}
