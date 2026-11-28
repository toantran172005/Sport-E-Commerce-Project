package com.sportecommerce;

import com.sportecommerce.config.VNPayConfig;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Payment;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.PaymentRepository;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.impl.PaymentServiceImpl;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.VNPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Kiem thu xu ly ket qua VNPay (IPN): chu ky, so tien, idempotency, don da huy. */
@ExtendWith(MockitoExtension.class)
class PaymentWebhookTest {

    private static final String SECRET = "TESTSECRETTESTSECRETTESTSECRET12";

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
        order = Order.builder().id(10L).orderCode("ORD-1").totalAmount(500000.0).status(OrderStatus.PENDING).build();
        payment = Payment.builder().order(order).status(PaymentStatus.PENDING).build();
    }

    /** Tao tham so VNPay co chu ky hop le (hoac sai chu ky neu tamper = true). */
    private Map<String, String> signedParams(String amount, String responseCode, boolean tamper) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "ORD-1");
        params.put("vnp_Amount", amount);
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TransactionStatus", responseCode);
        params.put("vnp_TransactionNo", "TX123");
        String query = VNPayUtil.buildQueryUrl(params, SECRET);
        String hash = query.substring(query.lastIndexOf("vnp_SecureHash=") + "vnp_SecureHash=".length());
        params.put("vnp_SecureHash", tamper ? "bad" : hash);
        return params;
    }

    private void stubOrderAndPayment() {
        when(orderRepository.findByOrderCodeForUpdate("ORD-1")).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(10L)).thenReturn(Optional.of(payment));
    }

    @Test
    @DisplayName("Chu ky sai -> RspCode 97, khong dong vao don/thanh toan")
    void invalidSignatureIsRejected() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);

        Map<String, String> res = paymentService.handleIpn(signedParams("50000000", "00", true));

        assertEquals("97", res.get("RspCode"));
        verifyNoInteractions(orderRepository, orderService, notificationService);
    }

    @Test
    @DisplayName("So tien VNPay bao khac so tien don -> RspCode 04, khong ghi nhan thanh toan")
    void wrongAmountIsRejected() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);
        stubOrderAndPayment();

        Map<String, String> res = paymentService.handleIpn(signedParams("1000", "00", false));

        assertEquals("04", res.get("RspCode"));
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        verify(orderService, never()).confirmOrder(any());
    }

    @Test
    @DisplayName("Thanh toan thanh cong hop le -> PAID, xac nhan don, gui thong bao")
    void successfulPaymentConfirmsOrder() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);
        stubOrderAndPayment();

        Map<String, String> res = paymentService.handleIpn(signedParams("50000000", "00", false));

        assertEquals("00", res.get("RspCode"));
        assertEquals(PaymentStatus.PAID, payment.getStatus());
        verify(orderService).confirmOrder(10L);
        verify(notificationService).notifyPaymentSuccess(order);
    }

    @Test
    @DisplayName("VNPay goi lai IPN lan 2 -> RspCode 02, khong xac nhan don lan nua")
    void replayedIpnIsIdempotent() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);
        stubOrderAndPayment();
        payment.setStatus(PaymentStatus.PAID);

        Map<String, String> res = paymentService.handleIpn(signedParams("50000000", "00", false));

        assertEquals("02", res.get("RspCode"));
        verify(orderService, never()).confirmOrder(any());
        verify(notificationService, never()).notifyPaymentSuccess(any());
    }

    @Test
    @DisplayName("Tien ve sau khi don da bi huy -> chuyen REFUND, khong hoi sinh don")
    void paymentForCanceledOrderGoesToRefund() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);
        stubOrderAndPayment();
        order.setStatus(OrderStatus.CANCELED);

        Map<String, String> res = paymentService.handleIpn(signedParams("50000000", "00", false));

        assertEquals("00", res.get("RspCode"));
        assertEquals(PaymentStatus.REFUND, payment.getStatus());
        verify(orderService, never()).confirmOrder(any());
    }

    @Test
    @DisplayName("Giao dich that bai -> FAILED va thong bao that bai")
    void failedTransactionMarksPaymentFailed() {
        when(vnPayConfig.getHashSecret()).thenReturn(SECRET);
        stubOrderAndPayment();

        Map<String, String> res = paymentService.handleIpn(signedParams("50000000", "24", false));

        assertEquals("00", res.get("RspCode"));
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        verify(notificationService).notifyPaymentFailed(order);
    }
}
