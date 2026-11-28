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
        refreshOrdersAfterCommit(order.getUser().getId());
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
        refreshOrdersAfterCommit(order.getUser().getId());
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
                .content(String.format("Đơn hàng %s đã được ghi nhận. Bạn sẽ thanh toán khi nhận hàng, cửa hàng sẽ sớm xác nhận đơn cho bạn.",
                        order.getOrderCode()))
                .referenceId(order.getId())
                .data(Map.of("orderCode", order.getOrderCode(), "status", "PENDING"))
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

    /**
     * Nội dung thông báo gửi khách theo trạng thái mới của đơn: viết như lời nhắn cho khách,
     * không lộ tên trạng thái kỹ thuật. Trả về {tiêu đề, nội dung}.
     */
    public static String[] describeOrderStatus(String orderCode, OrderStatus newStatus) {
        String code = orderCode == null ? "của bạn" : orderCode;
        if (newStatus == null) {
            return new String[]{"Đơn hàng " + code + " có cập nhật mới",
                    "Đơn hàng " + code + " vừa có cập nhật mới. Bạn mở chi tiết đơn hàng để xem nhé."};
        }
        return switch (newStatus) {
            case PENDING -> new String[]{"Đơn hàng đang chờ xử lý",
                    "Đơn hàng " + code + " đang chờ cửa hàng tiếp nhận."};
            case CONFIRMED -> new String[]{"Đơn hàng đã được xác nhận",
                    "Đơn hàng " + code + " của bạn đã được xác nhận. Cửa hàng đang chuẩn bị hàng cho bạn."};
            case PROCESSING -> new String[]{"Đơn hàng đang được đóng gói",
                    "Đơn hàng " + code + " đang được đóng gói và chuẩn bị bàn giao cho đơn vị vận chuyển."};
            case SHIPPED -> new String[]{"Đơn hàng đang trên đường giao đến bạn",
                    "Đơn hàng " + code + " đã được bàn giao cho đơn vị vận chuyển. Bạn chú ý điện thoại để nhận hàng nhé."};
            case DELIVERED -> new String[]{"Giao hàng thành công",
                    "Đơn hàng " + code + " đã được giao thành công. Cảm ơn bạn đã mua sắm, hãy để lại đánh giá sản phẩm nhé!"};
            case CANCELED -> new String[]{"Đơn hàng đã được hủy",
                    "Đơn hàng " + code + " đã được hủy. Nếu bạn đã thanh toán trước, cửa hàng sẽ xử lý hoàn tiền cho bạn."};
            case RETURN_REQUESTED -> new String[]{"Đã nhận yêu cầu hoàn trả",
                    "Yêu cầu hoàn trả đơn hàng " + code + " của bạn đã được ghi nhận. Cửa hàng sẽ xử lý sớm nhất."};
            case RETURNED -> new String[]{"Đơn hàng đã được hoàn trả",
                    "Đơn hàng " + code + " đã được hoàn trả thành công. Nếu bạn đã thanh toán trước, cửa hàng sẽ hoàn tiền cho bạn."};
        };
    }

    // REQUIRES_NEW: xem ghi chu o notifyStaffNewOrder
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyCustomerOrderStatusChanged(Long orderId, String orderCode, Long customerId,
                                                  OrderStatus oldStatus, OrderStatus newStatus) {
        User customer = userRepository.findUserById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy khách hàng để gửi thông báo cập nhật đơn hàng!"));

        String[] text = describeOrderStatus(orderCode, newStatus);

        Notification notification = Notification.builder()
                .user(customer)
                .type(NotificationType.ORDER_UPDATE)
                .title(text[0])
                .content(text[1])
                .referenceId(orderId)
                .data(Map.of("orderCode", orderCode, "status", newStatus.name()))
                .isRead(false)
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

    /** Thanh toán đổi trạng thái đơn: báo khách và ADMIN/STAFF tự tải lại danh sách đơn. */
    private void refreshOrdersAfterCommit(Long customerId) {
        Runnable refresh = () -> {
            try {
                notificationStreamService.publishRefresh(customerId, "orders");
                notificationStreamService.publishRefreshToBackOffice("orders");
            } catch (Exception ex) {
                log.debug("Không đẩy được tín hiệu làm mới đơn hàng: {}", ex.getMessage());
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    refresh.run();
                }
            });
        } else {
            refresh.run();
        }
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
