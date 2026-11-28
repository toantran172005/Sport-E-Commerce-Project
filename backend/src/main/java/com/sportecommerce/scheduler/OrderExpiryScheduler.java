package com.sportecommerce.scheduler;

import com.sportecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Tự hủy đơn thanh toán online mà khách bỏ dở (không thanh toán sau một khoảng thời gian), để trả lại
 * kho và lượt mã giảm giá. Mỗi đơn được hủy trong transaction riêng, có khóa dòng nên an toàn khi
 * webhook VNPay về cùng lúc.
 *
 * Lưu ý khi chạy nhiều bản backend: job này chạy ở mọi bản. Việc khóa dòng khiến chạy trùng vẫn an toàn,
 * nhưng nếu cần chính xác tuyệt đối nên dùng ShedLock.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpiryScheduler {

    private final OrderService orderService;

    /** Đơn thanh toán online chưa trả tiền được giữ 24 giờ (1440 phút) rồi tự hủy. Link VNPay mỗi lần chỉ sống 15 phút nhưng khách bấm "Thanh toán lại" để lấy link mới. */
    @Value("${app.order.unpaid-expire-minutes:1440}")
    private long expireMinutes;

    @Value("${app.order.expire-batch-size:50}")
    private int batchSize;

    @Scheduled(fixedDelayString = "${app.order.expire-scan-ms:60000}",
            initialDelayString = "${app.order.expire-initial-delay-ms:60000}")
    public void cancelExpiredUnpaidOrders() {
        try {
            Instant cutoff = Instant.now().minus(expireMinutes, ChronoUnit.MINUTES);
            List<Long> orderIds = orderService.findExpiredUnpaidOrderIds(cutoff, batchSize);
            int cancelled = 0;
            for (Long orderId : orderIds) {
                try {
                    if (orderService.expireOrderIfUnpaid(orderId, cutoff)) {
                        cancelled++;
                    }
                } catch (Exception ex) {
                    log.warn("Không thể tự hủy đơn quá hạn thanh toán (id={}): {}", orderId, ex.getMessage());
                }
            }
            if (cancelled > 0) {
                log.info("Đã tự hủy {} đơn quá hạn thanh toán", cancelled);
            }
        } catch (Exception ex) {
            log.warn("Job hủy đơn quá hạn thanh toán gặp lỗi: {}", ex.getMessage());
        }
    }
}
