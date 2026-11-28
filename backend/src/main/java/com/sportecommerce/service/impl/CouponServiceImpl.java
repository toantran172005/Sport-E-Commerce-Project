package com.sportecommerce.service.impl;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.sportecommerce.dto.request.CouponRequest;
import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.dto.response.DiscountResultDTO;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.entity.CouponUsage;
import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.DiscountType;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.CouponRepository;
import com.sportecommerce.repository.CouponUsageRepository;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.CouponService;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {

    private static final ZoneId HANOI_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final MapperUtil mapperUtil;

    @Override
    @Transactional(readOnly = true)
    public DiscountResultDTO validateAndCalculateDiscount(String code, Double orderAmount, Long userId) {
        Coupon coupon = getValidCoupon(code, orderAmount, userId);
        Double discountAmount = calculateDiscount(coupon, orderAmount);
        Double newTotal = Math.max(0.0, orderAmount - discountAmount);
        CouponResponse couponResponse = enrichCouponResponse(coupon);

        return DiscountResultDTO.builder()
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .discountAmount(discountAmount)
                .newTotal(newTotal)
                .message("Áp dụng mã giảm giá thành công")
                .coupon(couponResponse)
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
                discount = Math.round((orderAmount * coupon.getDiscountValue()) / 100.0);
                if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount() > 0 && discount > coupon.getMaxDiscountAmount()) {
                    discount = coupon.getMaxDiscountAmount();
                }
            }
            case FIXED_AMOUNT -> discount = Math.min(coupon.getDiscountValue(), orderAmount);
            case FREE_SHIPPING -> discount = 0.0;
        }

        return (double) Math.round(discount);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getValidCoupon(String code, Double orderAmount, Long userId) {
        if (code == null || code.trim().isEmpty()) {
            throw new AppException("Mã giảm giá không được để trống");
        }

        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new AppException("Mã không tồn tại hoặc ngưng áp dụng"));

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new AppException("Mã không tồn tại hoặc ngưng áp dụng");
        }

        Instant now = Instant.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new AppException("Mã khuyến mãi chưa đến thời gian áp dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new AppException("Mã khuyến mãi đã hết hạn");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException("Mã đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount != null && orderAmount < coupon.getMinOrderAmount()) {
            throw new AppException("Đơn hàng chưa đạt được giá trị áp dụng tối thiểu của mã giảm giá");
        }

        if (userId != null && couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new AppException("Bạn đã sử dụng mã giảm giá này rồi!");
        }

        return coupon;
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "coupons", allEntries = true)
    public void recordUsage(String couponCode, Long userId, Long orderId, Double discountAmount) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new AppException("Mã không tồn tại hoặc ngưng áp dụng"));

        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin đơn hàng!"));

        // Tăng lượt dùng nguyên tử: chỉ thành công khi chưa chạm giới hạn (chống vượt lượt khi nhiều người dùng cùng lúc)
        if (couponRepository.increaseUsedCountIfAvailable(coupon.getId()) == 0) {
            throw new AppException("Mã đã hết lượt sử dụng");
        }

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
            try {
                couponUsageRepository.save(couponUsage);
            } catch (DataIntegrityViolationException ex) {
                // Chỉ mục duy nhất (coupon_id, user_id): cùng một khách dùng 1 mã ở 2 đơn đồng thời
                throw new AppException("Bạn đã sử dụng mã giảm giá này rồi!");
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("coupons")
    public List<CouponResponse> getAvailableCoupons() {
        Instant now = Instant.now();
        return couponRepository.findByIsActiveTrue().stream()
                .filter(c -> c.getStartDate() == null || !now.isBefore(c.getStartDate()))
                .filter(c -> c.getEndDate() == null || !now.isAfter(c.getEndDate()))
                .map(this::enrichCouponResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons(boolean activeOnly) {
        if (activeOnly) {
            return getAvailableCoupons();
        }
        return couponRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::enrichCouponResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá!"));
        return enrichCouponResponse(coupon);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "coupons", allEntries = true)
    public CouponResponse createCoupon(CouponRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCode(cleanCode)) {
            throw new BadRequestException("Mã giảm giá '" + cleanCode + "' đã tồn tại trong hệ thống!");
        }

        double discountValue = request.getDiscountValue() != null ? request.getDiscountValue() : 0.0;
        double minOrderAmount = request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0.0;
        int usageLimit = request.getUsageLimit() != null ? request.getUsageLimit() : 100;

        validateCouponRules(
                request.getDiscountType(),
                discountValue,
                minOrderAmount,
                request.getMaxDiscountAmount(),
                usageLimit,
                0
        );

        Instant start = parseDateInput(request.getStartDate(), true, Instant.now());
        Instant end = parseDateInput(request.getEndDate(), false, Instant.now().plus(365, ChronoUnit.DAYS));
        if (end.isBefore(start)) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        Coupon coupon = Coupon.builder()
                .code(cleanCode)
                .discountType(request.getDiscountType())
                .discountValue(discountValue)
                .minOrderAmount(minOrderAmount)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(usageLimit)
                .usedCount(0)
                .startDate(start)
                .endDate(end)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        CouponResponse response = enrichCouponResponse(saved);

        if (Boolean.TRUE.equals(saved.getIsActive())) {
            try {
                notificationService.notifyPromotionCreated(saved, response.getDescription());
            } catch (Exception ex) {
                log.warn("Không thể gửi thông báo PROMOTION cho mã {}: {}", saved.getCode(), ex.getMessage());
            }
        }

        return response;
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "coupons", allEntries = true)
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));

        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            String cleanCode = request.getCode().trim().toUpperCase();
            if (!cleanCode.equalsIgnoreCase(coupon.getCode()) && couponRepository.existsByCode(cleanCode)) {
                throw new BadRequestException("Mã giảm giá '" + cleanCode + "' đã tồn tại!");
            }
            coupon.setCode(cleanCode);
        }

        if (request.getDiscountType() != null) {
            coupon.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
            coupon.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinOrderAmount() != null) {
            coupon.setMinOrderAmount(request.getMinOrderAmount());
        }
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) {
            coupon.setUsageLimit(request.getUsageLimit());
        }
        if (request.getStartDate() != null && !request.getStartDate().trim().isEmpty()) {
            coupon.setStartDate(parseDateInput(request.getStartDate(), true, coupon.getStartDate()));
        }
        if (request.getEndDate() != null && !request.getEndDate().trim().isEmpty()) {
            coupon.setEndDate(parseDateInput(request.getEndDate(), false, coupon.getEndDate()));
        }
        if (coupon.getEndDate().isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu!");
        }
        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        }

        validateCouponRules(
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getUsageLimit(),
                coupon.getUsedCount()
        );

        Coupon saved = couponRepository.save(coupon);
        return enrichCouponResponse(saved);
    }

    private void validateCouponRules(
            DiscountType discountType,
            Double discountValue,
            Double minOrderAmount,
            Double maxDiscountAmount,
            Integer usageLimit,
            Integer usedCount
    ) {
        if (discountType == null) {
            throw new BadRequestException("Loại giảm giá không được để trống!");
        }
        double val = discountValue != null ? discountValue : 0.0;
        if (val < 0) {
            throw new BadRequestException("Giá trị giảm không được âm!");
        }
        if (discountType == DiscountType.PERCENTAGE && (val <= 0 || val > 100)) {
            throw new BadRequestException("Giá trị giảm theo phần trăm phải lớn hơn 0 và nhỏ hơn hoặc bằng 100!");
        }
        if (discountType == DiscountType.FIXED_AMOUNT && val <= 0) {
            throw new BadRequestException("Giá trị giảm cố định phải lớn hơn 0!");
        }
        if (minOrderAmount != null && minOrderAmount < 0) {
            throw new BadRequestException("Đơn hàng tối thiểu không được âm!");
        }
        if (maxDiscountAmount != null && maxDiscountAmount < 0) {
            throw new BadRequestException("Mức giảm tối đa không được âm!");
        }
        if (usageLimit != null) {
            if (usageLimit <= 0) {
                throw new BadRequestException("Giới hạn lượt dùng phải lớn hơn 0!");
            }
            int currentUsed = usedCount != null ? usedCount : 0;
            if (usageLimit < currentUsed) {
                throw new BadRequestException(
                        "Giới hạn lượt dùng không được nhỏ hơn số lượt đã sử dụng (" + currentUsed + ")!"
                );
            }
        }
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "coupons", allEntries = true)
    public CouponResponse toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));
        if (coupon.getEndDate() != null && Instant.now().isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã khuyến mãi đã hết hạn, không thể thay đổi trạng thái!");
        }
        coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        Coupon saved = couponRepository.save(coupon);
        return enrichCouponResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "coupons", allEntries = true)
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));

        if (coupon.getOrders() != null && !coupon.getOrders().isEmpty()) {
            for (Order order : coupon.getOrders()) {
                order.setCoupon(null);
            }
            orderRepository.saveAll(coupon.getOrders());
        }

        couponRepository.delete(coupon);
    }

    private Instant parseDateInput(String input, boolean isStartOfDay, Instant fallback) {
        if (input == null || input.trim().isEmpty()) {
            return fallback;
        }
        String trimmed = input.trim();
        try {
            if (trimmed.contains("T")) {
                return Instant.parse(trimmed);
            }
            LocalDate localDate = LocalDate.parse(trimmed);
            if (isStartOfDay) {
                return localDate.atStartOfDay(HANOI_ZONE).toInstant();
            } else {
                return localDate.atTime(23, 59, 59).atZone(HANOI_ZONE).toInstant();
            }
        } catch (Exception e) {
            return fallback;
        }
    }

    private CouponResponse enrichCouponResponse(Coupon coupon) {
        CouponResponse response = mapperUtil.mapToCouponResponse(coupon);
        response.setCreatedAt(coupon.getCreatedAt());
        response.setDescription(buildDescription(coupon));
        return response;
    }

    private String buildDescription(Coupon coupon) {
        NumberFormat vnd = NumberFormat.getInstance(Locale.of("vi", "VN"));
        String minOrderText = (coupon.getMinOrderAmount() != null && coupon.getMinOrderAmount() > 0)
                ? " cho đơn từ " + vnd.format(Math.round(coupon.getMinOrderAmount())) + "₫"
                : " cho mọi đơn hàng";

        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            long pct = Math.round(coupon.getDiscountValue() != null ? coupon.getDiscountValue() : 0);
            String maxText = (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount() > 0)
                    ? " (tối đa " + vnd.format(Math.round(coupon.getMaxDiscountAmount())) + "₫)"
                    : "";
            return "Giảm " + pct + "%" + maxText + minOrderText;
        } else if (coupon.getDiscountType() == DiscountType.FREE_SHIPPING) {
            return "Miễn phí vận chuyển" + minOrderText;
        } else {
            long val = Math.round(coupon.getDiscountValue() != null ? coupon.getDiscountValue() : 0);
            return "Giảm " + vnd.format(val) + "₫" + minOrderText;
        }
    }
}
