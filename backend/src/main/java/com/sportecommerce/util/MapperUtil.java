package com.sportecommerce.util;

import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.OrderItem;
import com.sportecommerce.entity.Payment;
import com.sportecommerce.dto.response.CategoryResponse;
import com.sportecommerce.dto.response.ProductImageResponse;
import com.sportecommerce.dto.response.ProductResponse;
import com.sportecommerce.dto.response.ProductSummaryResponse;
import com.sportecommerce.dto.response.ProductVariantResponse;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.entity.Category;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.ProductImage;
import com.sportecommerce.entity.ProductVariant;
import com.sportecommerce.entity.User;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
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
        return mapOrderToOrderDetailResponse(order, null);
    }

    public com.sportecommerce.dto.response.OrderDetailResponse mapOrderToOrderDetailResponse(Order order, List<OrderItem> items) {
        String providerCode = null;
        String providerName = null;
        String trackingNum = null;
        com.sportecommerce.dto.response.OrderDetailResponse.ShipmentSummary shipmentSummary = null;

        if (order.getShipment() != null) {
            com.sportecommerce.entity.Shipment s = order.getShipment();
            trackingNum = s.getTrackingNumber();
            if (s.getProvider() != null) {
                providerCode = s.getProvider().getCode();
                providerName = s.getProvider().getName();
            }
            shipmentSummary = com.sportecommerce.dto.response.OrderDetailResponse.ShipmentSummary.builder()
                    .provider(com.sportecommerce.dto.response.OrderDetailResponse.ShipmentSummary.ProviderInfo.builder()
                            .code(providerCode)
                            .name(providerName)
                            .build())
                    .trackingNumber(trackingNum)
                    .status(s.getStatus() != null ? s.getStatus().name() : null)
                    .shippingFee(s.getShippingFee())
                    .build();
        }

        String payMethod = null;
        String payStatus = null;
        com.sportecommerce.dto.response.OrderDetailResponse.PaymentSummary paymentSummary = null;
        if (order.getPayment() != null) {
            com.sportecommerce.entity.Payment p = order.getPayment();
            payMethod = p.getMethod() != null ? p.getMethod().name() : null;
            payStatus = p.getStatus() != null ? p.getStatus().name() : null;
            paymentSummary = com.sportecommerce.dto.response.OrderDetailResponse.PaymentSummary.builder()
                    .method(payMethod)
                    .status(payStatus)
                    .amount(p.getAmount())
                    .transactionCode(p.getTransactionCode())
                    .paidAt(p.getPaidAt())
                    .build();
        }

        com.sportecommerce.dto.response.OrderDetailResponse.UserSummary userSummary = null;
        String custName = null;
        String custPhone = null;
        String custEmail = null;
        if (order.getUser() != null) {
            User u = order.getUser();
            custName = u.getFullName();
            custPhone = u.getPhoneNumber();
            custEmail = u.getEmail();
            userSummary = com.sportecommerce.dto.response.OrderDetailResponse.UserSummary.builder()
                    .id(u.getId())
                    .fullName(custName)
                    .phoneNumber(custPhone)
                    .email(custEmail)
                    .build();
        }

        String recipientName = null;
        String recipientPhone = null;
        String recipientAddress = null;
        if (order.getShippingAddress() != null) {
            recipientName = order.getShippingAddress().getRecipientName();
            recipientPhone = order.getShippingAddress().getPhoneNumber();
            recipientAddress = order.getShippingAddress().getAddressLine() + ", "
                    + order.getShippingAddress().getWard() + ", "
                    + order.getShippingAddress().getDistrict() + ", "
                    + order.getShippingAddress().getCity();
        } else if (order.getShippingAddressSnapshot() != null) {
            String snap = order.getShippingAddressSnapshot();
            String[] parts = snap.split(" - ");
            if (parts.length >= 1) recipientName = parts[0].trim();
            if (parts.length >= 2) recipientPhone = parts[1].trim();
            if (parts.length >= 3) recipientAddress = parts[2].trim();
        }

        List<com.sportecommerce.dto.response.OrderDetailResponse.OrderItemSummary> itemSummaries = null;
        List<OrderItem> orderItemsList = items != null ? items : order.getOrderItems();
        if (orderItemsList != null) {
            itemSummaries = orderItemsList.stream().map(oi -> {
                String img = null;
                Long vId = null;
                if (oi.getVariant() != null) {
                    vId = oi.getVariant().getId();
                    img = oi.getVariant().getImageUrl();
                }
                return com.sportecommerce.dto.response.OrderDetailResponse.OrderItemSummary.builder()
                        .id(oi.getId())
                        .variantId(vId)
                        .productName(oi.getProductNameSnapshot())
                        .productNameSnapshot(oi.getProductNameSnapshot())
                        .skuSnapshot(oi.getSkuSnapshot())
                        .variantSnapshot(oi.getVariantSnapshot())
                        .unitPrice(oi.getUnitPrice())
                        .price(oi.getUnitPrice())
                        .quantity(oi.getQuantity())
                        .subtotal(oi.getSubtotal())
                        .imageUrl(img)
                        .build();
            }).collect(Collectors.toList());
        }

        return com.sportecommerce.dto.response.OrderDetailResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .recipientSnapshot(order.getShippingAddressSnapshot())
                .shippingAddressSnapshot(order.getShippingAddressSnapshot())
                .recipientName(recipientName)
                .recipientPhone(recipientPhone)
                .recipientAddress(recipientAddress)
                .note(order.getNote())
                .cancelReason(order.getCancelReason())
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .canceledAt(order.getCanceledAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .paymentMethod(payMethod)
                .paymentStatus(payStatus)
                .shippingProviderCode(providerCode)
                .shippingProviderName(providerName)
                .trackingNumber(trackingNum)
                .customerName(custName)
                .customerPhone(custPhone)
                .customerEmail(custEmail)
                .user(userSummary)
                .shipment(shipmentSummary)
                .payment(paymentSummary)
                .orderItems(itemSummaries)
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
    public CategoryResponse mapToCategoryResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .isActive(c.getIsActive())
                .sortOrder(c.getSortOrder())
                .build();
    }

    public ProductSummaryResponse mapToProductSummaryResponse(Product p) {
        String primaryImageUrl = p.getProductImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> p.getProductImages().isEmpty()
                        ? null
                        : p.getProductImages().get(0).getImageUrl());

        int totalStock = p.getProductVariants() != null
                ? p.getProductVariants().stream()
                        .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                        .sum()
                : 0;
        int variantCount = p.getProductVariants() != null ? p.getProductVariants().size() : 0;
        String primarySku = (p.getProductVariants() != null && !p.getProductVariants().isEmpty())
                ? p.getProductVariants().get(0).getSku()
                : null;

        List<ProductVariantResponse> variantSummaries = p.getProductVariants() != null
                ? p.getProductVariants().stream()
                        .map(v -> ProductVariantResponse.builder()
                                .id(v.getId())
                                .sku(v.getSku())
                                .size(v.getSize())
                                .color(v.getColor())
                                .price(v.getPrice())
                                .salePrice(v.getSalePrice())
                                .stock(v.getStock())
                                .isActive(v.getIsActive())
                                .imageUrl(v.getImageUrl())
                                .build())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ProductSummaryResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .status(p.getStatus())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .primaryImageUrl(primaryImageUrl)
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .soldCount(p.getSoldCount() != null ? p.getSoldCount() : 0)
                .stock(totalStock)
                .isFeatured(p.getIsFeatured())
                .totalStock(totalStock)
                .variantCount(variantCount)
                .primarySku(primarySku)
                .variants(variantSummaries)
                .build();
    }

    public ProductResponse mapToProductResponse(Product p) {
        List<ProductVariantResponse> variantResponses = p.getProductVariants().stream()
                .map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .size(v.getSize())
                        .color(v.getColor())
                        .price(v.getPrice())
                        .salePrice(v.getSalePrice())
                        .stock(v.getStock())
                        .isActive(v.getIsActive())
                        .imageUrl(v.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        List<ProductImageResponse> imageResponses = p.getProductImages() == null
                ? Collections.emptyList()
                : p.getProductImages().stream()
                .map(i -> ProductImageResponse.builder()
                        .id(i.getId())
                        .imageUrl(i.getImageUrl())
                        .isPrimary(i.getIsPrimary())
                        .sortOrder(i.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(p.getId())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .sportType(p.getSportType())
                .status(p.getStatus())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .isFeatured(p.getIsFeatured())
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .soldCount(p.getSoldCount())
                .variants(variantResponses)
                .images(imageResponses)
                .createdAt(p.getCreatedAt())
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole())
                .status(user.getStatus())
                .mustChangePassword(user.getMustChangePassword())
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .phoneVerifiedAt(user.getPhoneVerifiedAt())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
