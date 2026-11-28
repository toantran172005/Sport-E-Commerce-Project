package com.sportecommerce;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.entity.Notification;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.Review;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.NotificationType;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.NotificationRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.NotificationStreamService;
import com.sportecommerce.service.impl.NotificationServiceImpl;
import com.sportecommerce.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Kiem thu Module Notification (TC-M4-17, TC-M4-18): tao thong bao theo su kien,
 * danh dau da doc, va cac rang buoc giao dich ma loi cu (thong bao khong duoc luu) phu thuoc vao.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationStreamService notificationStreamService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user(long id, UserRole role) {
        return User.builder().id(id).email("u" + id + "@mail.com").fullName("User " + id).role(role).build();
    }

    @Test
    @DisplayName("Don moi: moi STAFF nhan 1 thong bao NEW_ORDER gan voi don hang")
    void notifyStaffNewOrderShouldCreateOneNotificationPerStaff() {
        when(userRepository.findByRoleAndDeletedAtIsNull(UserRole.STAFF))
                .thenReturn(List.of(user(2, UserRole.STAFF), user(3, UserRole.STAFF)));

        notificationService.notifyStaffNewOrder(100L, "DH100");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(captor.capture());
        for (Notification n : captor.getAllValues()) {
            assertEquals(NotificationType.NEW_ORDER, n.getType());
            assertEquals(100L, n.getReferenceId());
            assertTrue(n.getContent().contains("DH100"));
            assertFalse(n.getIsRead());
        }
        assertEquals(2L, captor.getAllValues().get(0).getUser().getId());
        assertEquals(3L, captor.getAllValues().get(1).getUser().getId());
    }

    @Test
    @DisplayName("Don moi: khong co STAFF nao thi khong luu gi va khong loi")
    void notifyStaffNewOrderWithoutStaffShouldDoNothing() {
        when(userRepository.findByRoleAndDeletedAtIsNull(UserRole.STAFF)).thenReturn(List.of());

        assertDoesNotThrow(() -> notificationService.notifyStaffNewOrder(100L, "DH100"));

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Doi trang thai don: khach hang nhan thong bao ORDER_UPDATE ghi ro trang thai cu va moi")
    void notifyCustomerOrderStatusChangedShouldNotifyCustomer() {
        when(userRepository.findUserById(5L)).thenReturn(Optional.of(user(5, UserRole.CUSTOMER)));

        notificationService.notifyCustomerOrderStatusChanged(
                100L, "DH100", 5L, OrderStatus.PENDING, OrderStatus.CONFIRMED);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification n = captor.getValue();
        assertEquals(NotificationType.ORDER_UPDATE, n.getType());
        assertEquals(5L, n.getUser().getId());
        assertEquals(100L, n.getReferenceId());
        assertTrue(n.getContent().contains("PENDING") && n.getContent().contains("CONFIRMED"));
    }

    @Test
    @DisplayName("Phan hoi danh gia: khach hang viet danh gia nhan thong bao REVIEW_REPLY")
    void notifyReviewReplyShouldNotifyReviewAuthor() {
        Review review = Review.builder()
                .id(9L)
                .user(user(7, UserRole.CUSTOMER))
                .product(Product.builder().id(11L).name("Giay chay bo").build())
                .build();

        notificationService.notifyReviewReply(review, false);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification n = captor.getValue();
        assertEquals(NotificationType.REVIEW_REPLY, n.getType());
        assertEquals(7L, n.getUser().getId());
        assertEquals(9L, n.getReferenceId());
        assertTrue(n.getContent().contains("Giay chay bo"));
        assertEquals(11L, n.getData().get("productId"));
    }

    @Test
    @DisplayName("Phan hoi danh gia: danh gia khong co nguoi viet thi bo qua")
    void notifyReviewReplyWithoutAuthorShouldDoNothing() {
        notificationService.notifyReviewReply(Review.builder().id(9L).build(), false);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Thanh toan thanh cong: thong bao gan voi don hang cua chu don")
    void notifyPaymentSuccessShouldNotifyOrderOwner() {
        Order order = Order.builder().id(1L).orderCode("DH1").totalAmount(250000.0)
                .user(user(5, UserRole.CUSTOMER)).build();

        notificationService.notifyPaymentSuccess(order);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals(NotificationType.ORDER_UPDATE, captor.getValue().getType());
        assertEquals(5L, captor.getValue().getUser().getId());
    }

    @Test
    @DisplayName("Danh dau da doc: thong bao cua nguoi khac -> 404, khong sua du lieu")
    void markAsReadOfAnotherUsersNotificationShouldReturn404() {
        when(notificationRepository.findByIdAndUserId(50L, 5L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> notificationService.markAsRead(5L, 50L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Danh dau da doc: thong bao chua doc duoc danh dau va co thoi diem doc")
    void markAsReadShouldSetReadFlagAndTime() {
        Notification n = Notification.builder().id(50L).user(user(5, UserRole.CUSTOMER)).isRead(false).build();
        when(notificationRepository.findByIdAndUserId(50L, 5L)).thenReturn(Optional.of(n));

        ApiResponse<Void> res = notificationService.markAsRead(5L, 50L);

        assertTrue(res.isSuccess());
        assertTrue(n.getIsRead());
        assertNotNull(n.getReadAt());
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("Dem chua doc: tra ve so luong cua dung user")
    void countUnreadShouldReturnRepositoryCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(5L)).thenReturn(3L);

        assertEquals(3L, notificationService.countUnread(5L).getData());
    }

    // ===== Rang buoc giao dich (loi goc cua "thong bao khong duoc luu") =====

    @Test
    @DisplayName("Ham notify chay tu listener AFTER_COMMIT phai dung REQUIRES_NEW")
    void listenerDrivenNotifyMethodsMustUseRequiresNew() throws Exception {
        for (String name : List.of("notifyStaffNewOrder", "notifyCustomerOrderStatusChanged")) {
            var method = java.util.Arrays.stream(NotificationServiceImpl.class.getMethods())
                    .filter(m -> m.getName().equals(name)).findFirst().orElseThrow();
            Transactional tx = method.getAnnotation(Transactional.class);
            assertNotNull(tx, name + " thieu @Transactional");
            assertEquals(Propagation.REQUIRES_NEW, tx.propagation(), name + " phai la REQUIRES_NEW");
        }
    }

    @Test
    @DisplayName("updateOrderStatus phai chay trong transaction de event AFTER_COMMIT duoc kich hoat")
    void updateOrderStatusMustBeTransactional() throws Exception {
        var method = OrderServiceImpl.class.getMethod(
                "updateOrderStatus", Long.class, UpdateOrderStatusRequest.class);
        assertNotNull(method.getAnnotation(Transactional.class));
    }
}
