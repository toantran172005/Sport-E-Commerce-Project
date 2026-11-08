package com.sportecommerce.util;

import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.PaymentResponse;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.Order;
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

        return ProductSummaryResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .status(p.getStatus())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .primaryImageUrl(primaryImageUrl)
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .isFeatured(p.getIsFeatured())
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
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .phoneVerifiedAt(user.getPhoneVerifiedAt())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
