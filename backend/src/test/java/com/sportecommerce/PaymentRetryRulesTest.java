package com.sportecommerce;

import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Payment;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.PaymentRepository;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.impl.PaymentServiceImpl;
import com.sportecommerce.config.VNPayConfig;
import com.sportecommerce.util.MapperUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/** Quy tac thanh toan lai don VNPay: chan doi sang COD, chan don da tra tien, chan don qua han 24h. */
@ExtendWith(MockitoExtension.class)
class PaymentRetryRulesTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderService orderService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private VNPayConfig vnPayConfig;
    @Mock
    private MapperUtil mapperUtil;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        order = Order.builder().id(5L).orderCode("ORD-5").totalAmount(100000.0)
                .status(OrderStatus.PENDING).createdAt(Instant.now().minus(Duration.ofHours(2))).build();
        payment = Payment.builder().order(order).method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.PENDING).build();
        order.setPayment(payment);
        when(orderService.getOrderById(5L)).thenReturn(order);
    }

    private CreatePaymentRequest request(PaymentMethod method) {
        return CreatePaymentRequest.builder().orderId(5L).method(method).build();
    }

    @Test
    @DisplayName("Don VNPay dang cho thanh toan khong duoc doi sang COD")
    void cannotSwitchOnlineOrderToCod() {
        assertThrows(BadRequestException.class,
                () -> paymentService.createPayment(request(PaymentMethod.COD), null));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Don da thanh toan khong tao lai link thanh toan")
    void cannotRepayPaidOrder() {
        payment.setStatus(PaymentStatus.PAID);

        assertThrows(BadRequestException.class,
                () -> paymentService.createPayment(request(PaymentMethod.BANK_TRANSFER), null));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Don qua 24h chua thanh toan khong the thanh toan lai")
    void cannotRepayExpiredOrder() {
        order.setCreatedAt(Instant.now().minus(Duration.ofHours(25)));

        assertThrows(BadRequestException.class,
                () -> paymentService.createPayment(request(PaymentMethod.BANK_TRANSFER), null));
        verify(paymentRepository, never()).save(any());
    }
}
