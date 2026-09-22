package com.sportecommerce.service.impl;

import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.DiscountResultDTO;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.CouponUsage;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import com.sportecommerce.exception.InvalidCouponException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.CouponRepository;
import com.sportecommerce.repository.CouponUsageRepository;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.CouponService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final MapperUtil mapperUtil;

    @Override
    @Transactional(readOnly = true)
    public DiscountResultDTO validateAndCalculateDiscount(String code, Double orderAmount, Long userId) {
        Coupon coupon = getValidCoupon(code, orderAmount, userId);
        Double discountAmount = calculateDiscount(coupon, orderAmount);
        Double newTotal = Math.max(0.0, orderAmount - discountAmount);

        return DiscountResultDTO.builder()
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .newTotal(newTotal)
                .message("Áp dụng mã giảm giá thành công")
                .build();
    }

    @Override
    public Double calculateDiscount(Coupon coupon, Double orderAmount) {
        if (coupon == null || orderAmount == null || orderAmount <= 0) {
            return 0.0;
        }

        double discount = 0.0;
        switch (coupon.getDiscountType()) {
            case PERCENTAGE -> {
                discount = (orderAmount * coupon.getDiscountValue()) / 100.0;
                if (coupon.getMaxDiscountAmount() != null && discount > coupon.getMaxDiscountAmount()) {
                    discount = coupon.getMaxDiscountAmount();
                }
            }
            case FIXED_AMOUNT -> discount = Math.min(coupon.getDiscountValue(), orderAmount);
            case FREE_SHIPPING -> discount = 0.0;
        }

        return discount;
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getValidCoupon(String code, Double orderAmount, Long userId) {
        if (code == null || code.trim().isEmpty()) {
            throw new InvalidCouponException("Mã giảm giá không được để trống");
        }

        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new InvalidCouponException("Mã không tồn tại hoặc ngưng áp dụng"));

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new InvalidCouponException("Mã không tồn tại hoặc ngưng áp dụng");
        }

        Instant now = Instant.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new InvalidCouponException("Mã khuyến mãi chưa đến thời gian áp dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new InvalidCouponException("Mã khuyến mãi đã hết hạn");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new InvalidCouponException("Mã đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount != null && orderAmount < coupon.getMinOrderAmount()) {
            throw new InvalidCouponException("Đơn hàng chưa đạt được giá trị áp dụng tối thiểu của mã giảm giá");
        }

        if (userId != null && couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new InvalidCouponException("Bạn đã sử dụng mã giảm giá này rồi!");
        }

        return coupon;
    }

    @Override
    @Transactional
    public void recordUsage(String couponCode, Long userId, Long orderId, Double discountAmount) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException("Mã không tồn tại hoặc ngưng áp dụng"));

        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin đơn hàng!"));

        Optional<CouponUsage> existingUsage = couponUsageRepository.findByOrderId(orderId);
        if (existingUsage.isPresent()) {
            CouponUsage usage = existingUsage.get();
            usage.setCoupon(coupon);
            usage.setDiscountAmount(discountAmount != null ? discountAmount : 0.0);
            usage.setUsedAt(Instant.now());
            couponUsageRepository.save(usage);
        } else {
            CouponUsage couponUsage = CouponUsage.builder()
                    .coupon(coupon)
                    .user(user)
                    .order(order)
                    .discountAmount(discountAmount != null ? discountAmount : 0.0)
                    .build();
            couponUsageRepository.save(couponUsage);
        }

        coupon.setUsedCount((coupon.getUsedCount() != null ? coupon.getUsedCount() : 0) + 1);
        couponRepository.save(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAvailableCoupons() {
        return couponRepository.findByIsActiveTrue().stream()
                .map(mapperUtil::mapToCouponResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá!"));
        return mapperUtil.mapToCouponResponse(coupon);
    }

}

