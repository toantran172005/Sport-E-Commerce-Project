package com.sportecommerce.dto.response;

import com.sportecommerce.enums.OrderStatus;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long id;
    private String orderCode;
    private OrderStatus status;
    private Double subTotal;
    private Double discountAmount;
    private Double shippingFee;
    private Double totalAmount;
    private String recipientSnapshot;
    private String shippingAddressSnapshot;
    private String note;
    private String cancelReason;
    private Instant placedAt;
    private Instant confirmedAt;
    private Instant canceledAt;
    private Instant createdAt;
    private Instant updatedAt;

    // Flat convenience fields
    private String paymentMethod;
    private String paymentStatus;
    /** Hạn thanh toán (chỉ có khi đơn online đang chờ thanh toán). Quá hạn đơn bị tự hủy. */
    private Instant paymentExpiresAt;
    private String shippingProviderCode;
    private String shippingProviderName;
    private String trackingNumber;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Nested summaries
    private UserSummary user;
    private ShipmentSummary shipment;
    private PaymentSummary payment;
    private List<OrderItemSummary> orderItems;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;
        private String phoneNumber;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShipmentSummary {
        private ProviderInfo provider;
        private String trackingNumber;
        private String status;
        private Double shippingFee;

        @Getter
        @Setter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class ProviderInfo {
            private String code;
            private String name;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentSummary {
        private String method;
        private String status;
        private Double amount;
        private String transactionCode;
        private Instant paidAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemSummary {
        private Long id;
        private Long variantId;
        private String productName;
        private String productNameSnapshot;
        private String skuSnapshot;
        private String variantSnapshot;
        private Double unitPrice;
        private Double price;
        private Integer quantity;
        private Double subtotal;
        private String imageUrl;
    }
}
