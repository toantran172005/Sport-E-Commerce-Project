package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.ApplyCouponRequest;
import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.DiscountResultDTO;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<DiscountResultDTO>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        DiscountResultDTO result = couponService.validateAndCalculateDiscount(
                request.getCode(),
                request.getOrderAmount(),
                userId
        );

        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAvailableCoupons() {
        List<CouponResponse> coupons = couponService.getAvailableCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
        CouponResponse coupon = couponService.getCouponByCode(code);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }
}
