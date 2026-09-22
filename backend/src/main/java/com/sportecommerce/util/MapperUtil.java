package com.sportecommerce.util;

import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class MapperUtil {

    public PlaceOrderResponse mapOrderToPlaceOrderResponse(Order order) {
        return PlaceOrderResponse
                .builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .build();
    }

    public com.sportecommerce.dto.response.OrderDetailResponse mapOrderToOrderDetailResponse(Order order) {
        return com.sportecommerce.dto.response.OrderDetailResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .recipientSnapshot(order.getShippingAddressSnapshot())
                .note(order.getNote())
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .build();
    }

    public PaymentResponse mapToPaymentResponse(Payment payment, String paymentUrl, String message) {
        Order order = payment.getOrder();
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(order != null ? order.getId() : null)
                .orderCode(order != null ? order.getOrderCode() : null)
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .transactionCode(payment.getTransactionCode())
                .paidAt(payment.getPaidAt())
                .paymentUrl(paymentUrl)
                .message(message)
                .build();
    }

    public CouponResponse mapToCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .isActive(coupon.getIsActive())
                .build();
    }

}
