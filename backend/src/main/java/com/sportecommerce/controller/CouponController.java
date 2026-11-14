package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.ApplyCouponRequest;
import com.sportecommerce.dto.request.CouponRequest;
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
import java.util.Map;

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
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getCoupons(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<CouponResponse> coupons = couponService.getAllCoupons(activeOnly);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
        CouponResponse coupon = couponService.getCouponByCode(code);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        CouponResponse created = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo mã giảm giá thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse updated = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", updated));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CouponResponse>> toggleCouponPut(@PathVariable Long id) {
        CouponResponse updated = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái mã giảm giá thành công", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CouponResponse>> toggleCouponPatch(@PathVariable Long id) {
        CouponResponse updated = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái mã giảm giá thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", Map.of("deletedId", id)));
    }
}
