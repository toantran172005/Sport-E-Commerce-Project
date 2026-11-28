package com.sportecommerce.service.impl;

import com.sportecommerce.service.NotificationStreamService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class NotificationStreamServiceImpl implements NotificationStreamService {

    /** userId -> các kết nối đang mở (mỗi tab trình duyệt một kết nối). */
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final AtomicInteger connectionCount = new AtomicInteger();

    private final long timeoutMs;
    private final int maxPerUser;

    public NotificationStreamServiceImpl(
            MeterRegistry meterRegistry,
            @Value("${app.sse.timeout-ms:600000}") long timeoutMs,
            @Value("${app.sse.max-connections-per-user:5}") int maxPerUser) {
        this.timeoutMs = timeoutMs;
        this.maxPerUser = maxPerUser;
        meterRegistry.gauge("app.sse.connections", connectionCount);
    }

    @Override
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(timeoutMs);
        List<SseEmitter> list = emitters.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>());

        // Giới hạn số tab/user để một tài khoản không chiếm hết tài nguyên: đóng kết nối cũ nhất
        while (list.size() >= maxPerUser) {
            SseEmitter oldest = list.get(0);
            remove(userId, oldest);
            try {
                oldest.complete();
            } catch (Exception ignored) {
                // đã đóng
            }
        }

        list.add(emitter);
        connectionCount.incrementAndGet();

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(ex -> remove(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException | IllegalStateException ex) {
            remove(userId, emitter);
        }
        return emitter;
    }

    @Override
    public void publish(Long userId) {
        List<SseEmitter> list = emitters.get(userId);
        if (list == null || list.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("notification").data("new"));
            } catch (IOException | IllegalStateException ex) {
                remove(userId, emitter);
            }
        }
    }

    @Override
    public int activeConnections() {
        return connectionCount.get();
    }

    /** Heartbeat để proxy/trình duyệt không cắt kết nối rảnh và phát hiện sớm kết nối đã chết. */
    @Scheduled(fixedDelayString = "${app.sse.heartbeat-ms:25000}", initialDelayString = "${app.sse.heartbeat-ms:25000}")
    public void heartbeat() {
        emitters.forEach((userId, list) -> {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().comment("hb"));
                } catch (IOException | IllegalStateException ex) {
                    remove(userId, emitter);
                }
            }
        });
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(userId);
        if (list != null && list.remove(emitter)) {
            connectionCount.decrementAndGet();
            if (list.isEmpty()) {
                emitters.remove(userId, list);
            }
        }
    }
}
