package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.config.VNPayConfig;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Payment;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.PaymentRepository;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.PaymentService;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final NotificationService notificationService;
    private final VNPayConfig vnPayConfig;
    private final MapperUtil mapperUtil;

    private static final DateTimeFormatter VNPAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest) {
        Order order = orderService.getOrderById(request.getOrderId());

        if (order.getStatus() == OrderStatus.CONFIRMED && order.getPayment() != null 
                && order.getPayment().getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Đơn hàng này đã được thanh toán thành công!");
        }

        // 1. Thêm/cập nhật bản ghi payments với trạng thái PENDING
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrder(order);
                    return newPayment;
                });

        payment.setMethod(request.getMethod());
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        Payment savedPayment = paymentRepository.save(payment);

        // 2. Rẽ nhánh theo phương thức thanh toán
        if (request.getMethod() == PaymentMethod.COD) {
            // Giữ payments ở trạng thái PENDING, cập nhật orders.status = CONFIRMED
            orderService.confirmOrder(order.getId());
            notificationService.notifyOrderPlaced(order);

            return mapperUtil.mapToPaymentResponse(savedPayment, null,
                    "Đặt hàng thành công với hình thức thanh toán khi nhận hàng (COD).");
        }

        // Thanh toán online qua cổng thanh toán VNPay
        String paymentUrl = buildVNPayPaymentUrl(order, request.getBankCode(), httpRequest);
        return mapperUtil.mapToPaymentResponse(savedPayment, paymentUrl,
                "Tạo thông tin thanh toán thành công, vui lòng chuyển hướng đến URL thanh toán.");
    }

    @Override
    @Transactional
    public ApiResponse<Object> handleWebhook(Map<String, String> params) {
        log.info("Nhận Webhook từ cổng thanh toán VNPay: {}", params);

        // 1. Kiểm tra chữ ký bảo mật
        boolean isSignatureValid = VNPayUtil.verifySignature(params, vnPayConfig.getHashSecret());
        if (!isSignatureValid) {
            log.warn("Cảnh báo: Webhook chữ ký không hợp lệ! Bỏ qua yêu cầu.");
            throw new BadRequestException("Chữ ký không hợp lệ!");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        // 2. Tìm kiếm Payment & Order tương ứng qua txnRef
        Order order = orderRepository.findByOrderCode(txnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + txnRef));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin thanh toán cho đơn hàng!"));

        // 3. Tính Idempotency: nếu đơn đã được xác nhận thanh toán rồi thì trả về thành công ngay
        if (payment.getStatus() == PaymentStatus.PAID) {
            log.info("Đơn hàng {} đã được thanh toán trước đó. Bỏ qua xử lý lặp.", txnRef);
            return ApiResponse.success("Đã ghi nhận", Map.of("RspCode", "00", "Message", "Order already confirmed"));
        }

        // Kiểm tra kết quả giao dịch
        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setTransactionCode(transactionNo);
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);

            orderService.confirmOrder(order.getId());
            notificationService.notifyPaymentSuccess(order);

            log.info("Thanh toán thành công cho đơn hàng: {}", txnRef);
            return ApiResponse.success("Đã ghi nhận", Map.of("RspCode", "00", "Message", "Confirm Success"));
        } else {
            // Giao dịch thất bại
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            notificationService.notifyPaymentFailed(order);

            log.warn("Thanh toán thất bại cho đơn hàng: {}, mã lỗi VNPay: {}", txnRef, responseCode);
            return ApiResponse.success("Đã ghi nhận", Map.of("RspCode", "00", "Message", "Transaction Failed"));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có thông tin thanh toán cho đơn hàng ID: " + orderId));
        return mapperUtil.mapToPaymentResponse(payment, null, "Lấy thông tin thanh toán thành công");
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));
        return mapperUtil.mapToPaymentResponse(payment, null, "Lấy thông tin thanh toán thành công");
    }

    private String buildVNPayPaymentUrl(Order order, String bankCode, HttpServletRequest httpRequest) {
        ZonedDateTime nowHanoi = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        String createDate = nowHanoi.format(VNPAY_DATE_FORMATTER);
        String expireDate = nowHanoi.plusMinutes(15).format(VNPAY_DATE_FORMATTER);

        long amountInVnd = Math.round(order.getTotalAmount() * 100);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amountInVnd));
        vnpParams.put("vnp_CurrCode", vnPayConfig.getCurrCode());
        vnpParams.put("vnp_TxnRef", order.getOrderCode());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        if (bankCode != null && !bankCode.trim().isEmpty()) {
            vnpParams.put("vnp_BankCode", bankCode.trim());
        }

        String queryUrl = VNPayUtil.buildQueryUrl(vnpParams, vnPayConfig.getHashSecret());
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

}
