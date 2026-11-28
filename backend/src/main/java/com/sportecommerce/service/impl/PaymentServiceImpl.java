package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.config.VNPayConfig;
import com.sportecommerce.dto.request.CreatePaymentRequest;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.dto.response.RefundItemResponse;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Payment;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.exception.AppException;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
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

    /** Thời gian giữ đơn chờ thanh toán (phút), cùng cấu hình với job hủy đơn quá hạn. */
    @org.springframework.beans.factory.annotation.Value("${app.order.unpaid-expire-minutes:1440}")
    private long unpaidExpireMinutes = 1440;

    private static final DateTimeFormatter VNPAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest) {
        Order order = orderService.getOrderById(request.getOrderId());

        if (order.getStatus() == OrderStatus.CONFIRMED && order.getPayment() != null
                && order.getPayment().getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Đơn hàng này đã được thanh toán thành công!");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Đơn hàng không còn ở trạng thái chờ thanh toán!");
        }

        Payment existing = order.getPayment();
        if (existing != null && existing.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Đơn hàng này đã được thanh toán thành công!");
        }
        if (existing != null && existing.getMethod() != PaymentMethod.COD && request.getMethod() == PaymentMethod.COD) {
            // Chặn lách: đơn đã chọn thanh toán online thì không được đổi sang COD để nhân viên tiếp nhận khi chưa trả tiền
            throw new BadRequestException("Đơn hàng đã chọn thanh toán online, không thể đổi sang COD. Hãy thanh toán hoặc hủy đơn.");
        }
        if (request.getMethod() != PaymentMethod.COD && order.getCreatedAt() != null
                && order.getCreatedAt().plus(java.time.Duration.ofMinutes(unpaidExpireMinutes)).isBefore(Instant.now())) {
            throw new BadRequestException("Đơn hàng đã quá hạn thanh toán, vui lòng đặt lại đơn mới!");
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

        if (request.getMethod() == PaymentMethod.COD) {
            notificationService.notifyOrderPlaced(order);

            return mapperUtil.mapToPaymentResponse(savedPayment, null,
                    "Đặt hàng thành công với hình thức thanh toán khi nhận hàng (COD).");
        }

        String paymentUrl = buildVNPayPaymentUrl(order, request.getBankCode(), httpRequest);
        return mapperUtil.mapToPaymentResponse(savedPayment, paymentUrl,
                "Tạo thông tin thanh toán thành công, vui lòng chuyển hướng đến URL thanh toán.");
    }

    /**
     * Xác nhận thanh toán THỦ CÔNG (chỉ STAFF/ADMIN được gọi, kiểm tra ở controller).
     * Khách hàng KHÔNG được tự xác nhận: thanh toán online được ghi nhận tự động khi VNPay trả kết quả
     * có chữ ký hợp lệ (return URL hoặc IPN).
     */
    @Override
    @Transactional
    public PaymentResponse confirmQrPayment(Long orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrder(order);
                    newPayment.setMethod(PaymentMethod.BANK_TRANSFER);
                    newPayment.setAmount(order.getTotalAmount());
                    return newPayment;
                });

        if (payment.getStatus() != PaymentStatus.PAID) {
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new BadRequestException("Chỉ xác nhận thanh toán cho đơn đang chờ xử lý!");
            }
            payment.setStatus(PaymentStatus.PAID);
            if (payment.getTransactionCode() == null || payment.getTransactionCode().isEmpty()) {
                payment.setTransactionCode("MANUAL-" + System.currentTimeMillis());
            }
            payment.setPaidAt(Instant.now());
            payment = paymentRepository.save(payment);

            orderService.confirmOrder(order.getId());
            notificationService.notifyPaymentSuccess(order);
        }

        return mapperUtil.mapToPaymentResponse(payment, null, "Xác nhận thanh toán thành công");
    }

    /**
     * Kết quả xử lý 1 phản hồi VNPay. rspCode theo tài liệu IPN của VNPay:
     * 00 thành công | 01 không thấy đơn | 02 đã xác nhận trước đó | 04 sai số tiền | 97 sai chữ ký.
     */
    private record VnPayOutcome(String rspCode, String message, Order order, Payment payment, String responseCode) {
    }

    /**
     * Xử lý phản hồi VNPay (dùng chung cho return URL và IPN). Phải chạy trong transaction.
     * An toàn khi gọi lặp / gọi đồng thời nhờ khóa dòng đơn hàng + kiểm tra trạng thái.
     */
    private VnPayOutcome processVnPayResult(Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");

        // 1. Chữ ký bảo mật
        if (!VNPayUtil.verifySignature(params, vnPayConfig.getHashSecret())) {
            log.warn("Cảnh báo: phản hồi VNPay có chữ ký không hợp lệ! Bỏ qua yêu cầu.");
            return new VnPayOutcome("97", "Invalid signature", null, null, responseCode);
        }

        // 2. Tìm đơn (khóa ghi dòng đơn để 2 phản hồi đồng thời xếp hàng)
        String txnRef = params.get("vnp_TxnRef");
        Order order = txnRef == null ? null : orderRepository.findByOrderCodeForUpdate(txnRef).orElse(null);
        if (order == null) {
            return new VnPayOutcome("01", "Order not found", null, null, responseCode);
        }
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) {
            return new VnPayOutcome("01", "Payment not found", order, null, responseCode);
        }

        // 3. Số tiền VNPay báo phải khớp số tiền đơn hàng (VNPay nhân 100)
        long expectedAmount = Math.round(order.getTotalAmount() * 100);
        long receivedAmount;
        try {
            receivedAmount = Long.parseLong(params.get("vnp_Amount"));
        } catch (NumberFormatException ex) {
            receivedAmount = -1;
        }
        if (receivedAmount != expectedAmount) {
            log.warn("VNPay báo số tiền {} khác số tiền đơn {} (đơn {})", receivedAmount, expectedAmount, txnRef);
            return new VnPayOutcome("04", "Invalid amount", order, payment, responseCode);
        }

        // 4. Idempotency: đã ghi nhận thanh toán rồi thì bỏ qua
        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.REFUND) {
            log.info("Đơn hàng {} đã được ghi nhận thanh toán trước đó. Bỏ qua xử lý lặp.", txnRef);
            return new VnPayOutcome("02", "Order already confirmed", order, payment, responseCode);
        }

        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean success = "00".equals(responseCode)
                && (transactionStatus == null || transactionStatus.isEmpty() || "00".equals(transactionStatus));

        if (success) {
            payment.setTransactionCode(params.get("vnp_TransactionNo"));
            payment.setPaidAt(Instant.now());

            if (order.getStatus() == OrderStatus.CANCELED) {
                // Tiền đã về nhưng đơn đã bị hủy (VD: quá hạn thanh toán) -> ghi nhận cần hoàn tiền,
                // KHÔNG hồi sinh đơn vì kho đã được trả lại.
                payment.setStatus(PaymentStatus.REFUND);
                paymentRepository.save(payment);
                log.warn("Đơn {} đã hủy nhưng VNPay báo thanh toán thành công -> chuyển sang chờ hoàn tiền", txnRef);
            } else {
                payment.setStatus(PaymentStatus.PAID);
                paymentRepository.save(payment);
                orderService.confirmOrder(order.getId());
                notificationService.notifyPaymentSuccess(order);
                log.info("Thanh toán thành công cho đơn hàng: {}", txnRef);
            }
            return new VnPayOutcome("00", "Confirm Success", order, payment, responseCode);
        }

        // Giao dịch thất bại: chỉ đổi PENDING -> FAILED (không ghi đè CANCELLED), thông báo một lần
        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            notificationService.notifyPaymentFailed(order);
        }
        log.warn("Thanh toán thất bại cho đơn hàng: {}, mã lỗi VNPay: {}", txnRef, responseCode);
        return new VnPayOutcome("00", "Transaction Failed", order, payment, responseCode);
    }

    /** Trang kết quả (return URL) gọi để xác thực chữ ký và đồng bộ trạng thái. */
    @Override
    @Transactional
    public ApiResponse<Object> handleWebhook(Map<String, String> params) {
        log.info("Nhận kết quả thanh toán VNPay cho đơn: {}", params.get("vnp_TxnRef"));
        VnPayOutcome outcome = processVnPayResult(params);

        switch (outcome.rspCode()) {
            case "97" -> throw new BadRequestException("Chữ ký bảo mật VNPay không hợp lệ!");
            case "01" -> throw new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + params.get("vnp_TxnRef"));
            case "04" -> throw new BadRequestException("Số tiền thanh toán không khớp với đơn hàng!");
            default -> { }
        }

        Order order = outcome.order();
        Payment payment = outcome.payment();
        if ("02".equals(outcome.rspCode())) {
            return ApiResponse.success("Đã ghi nhận", buildWebhookResult(order, payment, outcome.responseCode(), "Order already confirmed"));
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            return ApiResponse.success("Giao dịch thanh toán không thành công",
                    buildWebhookResult(order, payment, outcome.responseCode(), "Transaction Failed"));
        }
        return ApiResponse.success("Thanh toán thành công",
                buildWebhookResult(order, payment, outcome.responseCode(), "Confirm Success"));
    }

    /** IPN của VNPay (server gọi server): luôn trả JSON {RspCode, Message}. */
    @Override
    @Transactional
    public Map<String, String> handleIpn(Map<String, String> params) {
        VnPayOutcome outcome = processVnPayResult(params);
        Map<String, String> result = new LinkedHashMap<>();
        result.put("RspCode", outcome.rspCode());
        result.put("Message", outcome.message());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundItemResponse> getRefunds(boolean refunded) {
        return paymentRepository.findRefunds(PaymentStatus.REFUND, refunded).stream()
                .map(this::toRefundItem)
                .toList();
    }

    @Override
    @Transactional
    public RefundItemResponse markRefunded(Long paymentId, String note) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));
        if (payment.getStatus() != PaymentStatus.REFUND) {
            throw new BadRequestException("Khoản thanh toán này không ở trạng thái chờ hoàn tiền!");
        }
        if (payment.getRefundedAt() != null) {
            throw new AppException("Khoản này đã được xác nhận hoàn tiền trước đó", HttpStatus.CONFLICT);
        }
        payment.setRefundedAt(Instant.now());
        String cleanNote = note == null ? null : note.trim();
        payment.setRefundNote(cleanNote == null || cleanNote.isEmpty() ? null : cleanNote);
        return toRefundItem(paymentRepository.save(payment));
    }

    private RefundItemResponse toRefundItem(Payment payment) {
        Order order = payment.getOrder();
        return RefundItemResponse.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .orderStatus(order.getStatus())
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .customerPhone(order.getUser() != null ? order.getUser().getPhoneNumber() : null)
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .transactionCode(payment.getTransactionCode())
                .paidAt(payment.getPaidAt())
                .refundedAt(payment.getRefundedAt())
                .refundNote(payment.getRefundNote())
                .build();
    }

    private Map<String, Object> buildWebhookResult(Order order, Payment payment, String responseCode, String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("RspCode", "00");
        result.put("Message", message);
        result.put("responseCode", responseCode);
        result.put("orderId", order.getId());
        result.put("orderCode", order.getOrderCode());
        result.put("paymentId", payment.getId());
        result.put("amount", payment.getAmount());
        result.put("status", payment.getStatus().name());
        result.put("transactionCode", payment.getTransactionCode());
        result.put("paidAt", payment.getPaidAt());
        return result;
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
