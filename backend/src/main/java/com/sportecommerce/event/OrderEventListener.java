package com.sportecommerce.event;

import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.NotificationStreamService;
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
    private final NotificationStreamService streamService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        try {
            notificationService.notifyStaffNewOrder(event.orderId(), event.orderCode());
        } catch (Exception e) {
            log.error("Loi khi gui thong bao don hang moi cho staff, orderId={}", event.orderId(), e);
        }
        refreshOrders(event.customerId(), false);
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
        // Huy/hoan tra co the tao muc cho hoan tien cua staff
        boolean refundMayChange = event.newStatus() == OrderStatus.CANCELED || event.newStatus() == OrderStatus.RETURNED;
        refreshOrders(event.customerId(), refundMayChange);
    }

    /**
     * Bao cho giao dien (qua SSE) tu tai lai danh sach don: khach so huu don + moi ADMIN/STAFF dang mo trang.
     * Chi gui ten nhom du lieu; khong anh huong nghiep vu neu day that bai.
     */
    private void refreshOrders(Long customerId, boolean refunds) {
        try {
            if (customerId != null) {
                streamService.publishRefresh(customerId, "orders");
            }
            streamService.publishRefreshToBackOffice("orders");
            if (refunds) {
                streamService.publishRefreshToBackOffice("refunds");
            }
        } catch (Exception e) {
            log.debug("Khong day duoc tin hieu lam moi don hang: {}", e.getMessage());
        }
    }
}
