package com.sportecommerce.event;

import com.sportecommerce.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Lang nghe cac event nghiep vu (dat hang, doi trang thai don hang...) va
 * chuyen thanh thong bao (Notification), theo dung khuyen nghi trong tai
 * lieu nghiep vu: tach roi logic tao Notification khoi logic nghiep vu chinh
 * (Order...) thong qua Spring Event, tranh phu thuoc truc tiep.
 *
 * Dung @TransactionalEventListener(AFTER_COMMIT) thay vi @EventListener thuong
 * de dam bao: neu transaction dat hang bi rollback (vi du het hang giua chung,
 * loi thanh toan...) thi se KHONG co thong bao "don hang moi" nao bi gui oan
 * cho staff ve mot don hang thuc ra chua duoc tao thanh cong.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        try {
            notificationService.notifyStaffNewOrder(event.orderId(), event.orderCode());
        } catch (Exception e) {
            // Khong duoc de loi gui thong bao lam anh huong nguoc lai luong dat hang
            // (transaction dat hang da commit xong truoc khi listener nay chay).
            log.error("Loi khi gui thong bao don hang moi cho staff, orderId={}", event.orderId(), e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        try {
            notificationService.notifyCustomerOrderStatusChanged(
                    event.orderId(),
                    event.orderCode(),
                    event.customerId(),
                    event.oldStatus(),
                    event.newStatus());
        } catch (Exception e) {
            log.error("Loi khi gui thong bao cap nhat trang thai don hang, orderId={}", event.orderId(), e);
        }
    }
}
