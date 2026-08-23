package com.sportecommerce.entity;

import com.sportecommerce.enums.OrderStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

//    @Column(name = "shipping_address_id", nullable = false)
//    private Shipping shipping;

//    @Column(name = "user_id", nullable = false)
//    private User user;

//    @Column(name = "coupon_id")
//    private Coupon coupon;

    @Column(name = "order_code", nullable = false, unique = true)
    private String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Column(name = "sub_total", nullable = false)
    private Double subTotal;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "shipping_fee")
    private Double shippingFee = 0.0;

    @Column(name = "tax_amount")
    private Double taxAmount = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    @Column(name = "shipping_address_snapshot", nullable = false)
    private String shippingAddressSnapshot;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "placed_at")
    private Instant placedAt = Instant.now();

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "canceled_at")
    private Instant canceledAt;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Instant updatedAt;

}
