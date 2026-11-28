package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.NotificationResponse;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.NotificationType;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.NotificationRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.NotificationStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class    NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationStreamService notificationStreamService;

    // ===== Nhom 1: thong bao gan voi luong dat hang / thanh toan (PaymentServiceImpl goi) =====

    @Override
    @Transactional
    public void notifyPaymentSuccess(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Thanh toán thành công")
                .content(String.format("Đơn hàng %s đã được thanh toán thành công với tổng số tiền %,.0f đ.",
                        order.getOrderCode(), order.getTotalAmount()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "PAID"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        pushAfterCommit(order.getUser().getId());
        log.info("Đã tạo thông báo thanh toán thành công cho đơn hàng: {}", order.getOrderCode());
    }

    @Override
    @Transactional
    public void notifyPaymentFailed(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Thanh toán thất bại")
                .content(String.format("Giao dịch thanh toán cho đơn hàng %s không thành công. Bạn có thể thử lại.",
                        order.getOrderCode()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "FAILED"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        pushAfterCommit(order.getUser().getId());
        log.warn("Đã tạo thông báo thanh toán thất bại cho đơn hàng: {}", order.getOrderCode());
    }

    @Override
    @Transactional
    public void notifyOrderPlaced(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .user(order.getUser())
                .type(NotificationType.ORDER_UPDATE)
                .title("Đặt hàng thành công")
                .content(String.format("Đơn hàng %s của bạn đã được xác nhận (COD). Bạn sẽ thanh toán khi nhận hàng.",
                        order.getOrderCode()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "CONFIRMED"))
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        pushAfterCommit(order.getUser().getId());
        log.info("Đã tạo thông báo đặt hàng thành công cho đơn hàng: {}", order.getOrderCode());
    }

    @Override
    @Transactional
    public void notifyPromotionCreated(Coupon coupon, String description) {
        if (coupon == null) {
            return;
        }

        List<User> customers = userRepository.findByRoleAndDeletedAtIsNull(UserRole.CUSTOMER);
        if (customers.isEmpty()) {
            return;
        }

        String title = "Khuyến mãi mới: " + coupon.getCode();
        String content = (description != null && !description.isBlank())
                ? "Nhập mã " + coupon.getCode() + " - " + description
                : "Mã khuyến mãi mới " + coupon.getCode() + " vừa được mở áp dụng!";

        List<Notification> notifications = customers.stream()
                .map(customer -> Notification.builder()
                        .user(customer)
                        .type(NotificationType.PROMOTION)
                        .title(title)
                        .content(content)
                        .referenceId(coupon.getId())
                        .data(Map.of("couponCode", coupon.getCode()))
                        .isRead(false)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
        pushAfterCommit(customers.stream().map(User::getId).toList());
        log.info("Đã gửi thông báo PROMOTION ({}) tới {} khách hàng", coupon.getCode(), notifications.size());
    }

    // ===== Nhom 2: thong bao theo kien truc Spring Event (OrderEventListener goi) =====

    // REQUIRES_NEW: ham nay duoc OrderEventListener goi o pha AFTER_COMMIT, luc do transaction cu da commit xong;
    // neu chi dung @Transactional (REQUIRED) thi ban ghi se tham gia transaction cu va KHONG bao gio duoc commit.
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyStaffNewOrder(Long orderId, String orderCode) {
        List<User> staffUsers = userRepository.findByRoleAndDeletedAtIsNull(UserRole.STAFF);

        if (staffUsers.isEmpty()) {
            log.warn("Co don hang moi (orderCode={}) nhung khong tim thay STAFF nao de gui thong bao.", orderCode);
            return;
        }

        String title = "Có đơn hàng mới";
        String content = "Đơn hàng " + orderCode + " vừa được đặt, vui lòng kiểm tra và xử lý.";

        for (User staff : staffUsers) {
            Notification notification = Notification.builder()
                    .user(staff)
                    .type(NotificationType.NEW_ORDER)
                    .title(title)
                    .content(content)
                    .referenceId(orderId)
                    .build();

            notificationRepository.save(notification);
        }
        pushAfterCommit(staffUsers.stream().map(User::getId).toList());
    }

    // REQUIRES_NEW: xem ghi chu o notifyStaffNewOrder
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyCustomerOrderStatusChanged(Long orderId, String orderCode, Long customerId,
                                                  OrderStatus oldStatus, OrderStatus newStatus) {
        User customer = userRepository.findUserById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy khách hàng để gửi thông báo cập nhật đơn hàng!"));

        String title = "Đơn hàng " + orderCode + " đã được cập nhật";
        String content = "Đơn hàng của bạn đã chuyển từ trạng thái " + oldStatus
                + " sang " + newStatus + ".";

        Notification notification = Notification.builder()
                .user(customer)
                .type(NotificationType.ORDER_UPDATE)
                .title(title)
                .content(content)
                .referenceId(orderId)
                .build();

        notificationRepository.save(notification);
        pushAfterCommit(customer.getId());
    }

    // REQUIRES_NEW: loi khi tao thong bao khong duoc lam transaction luu phan hoi danh gia bi danh dau rollback-only
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyReviewReply(Review review, boolean updated) {
        if (review == null || review.getUser() == null) {
            return;
        }

        String productName = review.getProduct() != null ? review.getProduct().getName() : "sản phẩm";
        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("reviewId", review.getId());
        if (review.getProduct() != null) {
            payload.put("productId", review.getProduct().getId());
        }

        Notification notification = Notification.builder()
                .user(review.getUser())
                .type(NotificationType.REVIEW_REPLY)
                .title(updated ? "Phản hồi đánh giá đã được cập nhật" : "Shop đã phản hồi đánh giá của bạn")
                .content("Ban quản trị đã " + (updated ? "cập nhật phản hồi" : "phản hồi")
                        + " đánh giá của bạn về sản phẩm \"" + productName + "\".")
                .referenceId(review.getId())
                .data(payload)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        pushAfterCommit(review.getUser().getId());
        log.info("Đã tạo thông báo phản hồi đánh giá cho reviewId={}", review.getId());
    }

    // ===== SSE: chi day tin hieu SAU KHI transaction commit (khong day thong bao cua giao dich bi rollback) =====

    private void pushAfterCommit(Long userId) {
        pushAfterCommit(List.of(userId));
    }

    private void pushAfterCommit(List<Long> userIds) {
        Runnable push = () -> {
            for (Long id : userIds) {
                try {
                    notificationStreamService.publish(id);
                } catch (Exception ex) {
                    log.debug("Không đẩy được SSE tới user {}: {}", id, ex.getMessage());
                }
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    push.run();
                }
            });
        } else {
            push.run();
        }
    }

    // ===== Nhom 3: API cho man hinh thong bao cua user (NotificationController goi) =====

    @Override
    public ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(Long userId, int page, int size) {
        Page<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        Page<NotificationResponse> mapped = notifications.map(NotificationResponse::fromEntity);

        return ApiResponse.success(PageResponse.fromPage(mapped));
    }

    @Override
    public ApiResponse<Long> countUnread(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return ApiResponse.success(count);
    }

    @Override
    @Transactional
    public ApiResponse<Void> markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(
                        "Không tìm thấy thông báo hoặc bạn không có quyền với thông báo này!", HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(OffsetDateTime.now());
            notificationRepository.save(notification);
        }

        return ApiResponse.success("Đã đánh dấu đã đọc", null);
    }

    @Override
    @Transactional
    public ApiResponse<Void> markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId, OffsetDateTime.now());
        return ApiResponse.success("Đã đánh dấu tất cả là đã đọc", null);
    }
}
