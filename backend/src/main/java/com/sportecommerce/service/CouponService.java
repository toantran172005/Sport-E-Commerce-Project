package com.sportecommerce.service;

import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.DiscountResultDTO;
import com.sportecommerce.entity.Coupon;

import java.util.List;

public interface CouponService {

    DiscountResultDTO validateAndCalculateDiscount(String code, Double orderAmount, Long userId);

    Double calculateDiscount(Coupon coupon, Double orderAmount);

    Coupon getValidCoupon(String code, Double orderAmount, Long userId);

    void recordUsage(String couponCode, Long userId, Long orderId, Double discountAmount);

    List<CouponResponse> getAvailableCoupons();

    CouponResponse getCouponByCode(String code);
}

