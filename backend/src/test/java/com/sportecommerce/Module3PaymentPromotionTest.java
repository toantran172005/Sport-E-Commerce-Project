package com.sportecommerce;

import com.sportecommerce.dto.request.CouponRequest;
import com.sportecommerce.dto.response.CouponResponse;
import com.sportecommerce.entity.Coupon;
import com.sportecommerce.enums.DiscountType;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.repository.CouponRepository;
import com.sportecommerce.repository.CouponUsageRepository;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.NotificationService;
import com.sportecommerce.service.impl.CouponServiceImpl;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.VNPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Module3PaymentPromotionTest {

    @Mock
    private CouponRepository couponRepository;
    @Mock
    private CouponUsageRepository couponUsageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private MapperUtil mapperUtil;

    @InjectMocks
    private CouponServiceImpl couponService;

    private Coupon activePercentCoupon;

    @BeforeEach
    void setUp() {
        activePercentCoupon = Coupon.builder()
                .id(1L)
                .code("TEST15")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(15.0)
                .minOrderAmount(0.0)
                .usageLimit(100)
                .usedCount(10)
                .startDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .endDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("TC-M3-03: Coupon hết hạn bị từ chối")
    void expiredCouponShouldThrow() {
        Coupon expired = Coupon.builder()
                .id(2L)
                .code("EXPIRED")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .isActive(true)
                .startDate(Instant.now().minus(10, ChronoUnit.DAYS))
                .endDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        when(couponRepository.findByCode("EXPIRED")).thenReturn(Optional.of(expired));

        AppException ex = assertThrows(AppException.class,
                () -> couponService.getValidCoupon("EXPIRED", 500000.0, 1L));
        assertTrue(ex.getMessage().contains("hết hạn"));
    }

    @Test
    @DisplayName("TC-M3-05: Coupon hết lượt sử dụng bị từ chối")
    void exhaustedCouponShouldThrow() {
        Coupon exhausted = Coupon.builder()
                .id(3L)
                .code("HETLUOT")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(50000.0)
                .usageLimit(5)
                .usedCount(5)
                .isActive(true)
                .startDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .endDate(Instant.now().plus(10, ChronoUnit.DAYS))
                .build();
        when(couponRepository.findByCode("HETLUOT")).thenReturn(Optional.of(exhausted));

        AppException ex = assertThrows(AppException.class,
                () -> couponService.getValidCoupon("HETLUOT", 500000.0, 1L));
        assertTrue(ex.getMessage().contains("hết lượt"));
    }

    @Test
    @DisplayName("TC-M3-07: Làm tròn giảm giá 15% của 999.999 = 150.000")
    void discountRoundingShouldMatch150000() {
        Double discount = couponService.calculateDiscount(activePercentCoupon, 999999.0);
        assertEquals(150000.0, discount);
    }

    @Test
    @DisplayName("TC-M3-12: VNPay checksum HMAC-SHA512 đúng & sai")
    void vnpayChecksumVerification() {
        String secret = "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN";
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "ORD-2026-001");
        params.put("vnp_Amount", "50000000");
        params.put("vnp_ResponseCode", "00");

        String query = VNPayUtil.buildQueryUrl(params, secret);
        String validHash = query.substring(query.lastIndexOf("vnp_SecureHash=") + "vnp_SecureHash=".length());

        params.put("vnp_SecureHash", validHash);
        assertTrue(VNPayUtil.verifySignature(params, secret));

        params.put("vnp_SecureHash", "invalid_checksum");
        assertFalse(VNPayUtil.verifySignature(params, secret));
    }

    @Test
    @DisplayName("TC-M3-13 & UC017: Tạo coupon hợp lệ gửi thông báo PROMOTION")
    void createCouponValidShouldSaveAndNotify() {
        CouponRequest req = CouponRequest.builder()
                .code("NEW10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .minOrderAmount(200000.0)
                .usageLimit(50)
                .startDate("2026-01-01")
                .endDate("2026-12-31")
                .isActive(true)
                .build();

        when(couponRepository.existsByCode("NEW10")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> {
            Coupon c = inv.getArgument(0);
            c.setId(99L);
            return c;
        });
        when(mapperUtil.mapToCouponResponse(any(Coupon.class)))
                .thenReturn(CouponResponse.builder().id(99L).code("NEW10").build());

        CouponResponse resp = couponService.createCoupon(req);
        assertEquals("NEW10", resp.getCode());
        verify(notificationService, times(1)).notifyPromotionCreated(any(Coupon.class), anyString());
    }

    @Test
    @DisplayName("TC-M3-17: Tạo coupon trùng mã bị chặn")
    void createDuplicateCouponShouldThrow() {
        CouponRequest req = CouponRequest.builder()
                .code("TEST15")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .build();
        when(couponRepository.existsByCode("TEST15")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> couponService.createCoupon(req));
    }

    @Test
    @DisplayName("TC-M3-18 & UC017: Chặn giá trị âm, % > 100, và usageLimit < usedCount")
    void invalidCouponValuesShouldThrow() {
        CouponRequest negativeVal = CouponRequest.builder()
                .code("NEG10")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(-10.0)
                .usageLimit(10)
                .build();
        when(couponRepository.existsByCode("NEG10")).thenReturn(false);
        assertThrows(BadRequestException.class, () -> couponService.createCoupon(negativeVal));

        CouponRequest over100 = CouponRequest.builder()
                .code("OVER100")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(150.0)
                .usageLimit(10)
                .build();
        when(couponRepository.existsByCode("OVER100")).thenReturn(false);
        assertThrows(BadRequestException.class, () -> couponService.createCoupon(over100));

        // UC017 3.1: update usageLimit < usedCount (usedCount = 10)
        when(couponRepository.findById(1L)).thenReturn(Optional.of(activePercentCoupon));
        CouponRequest lowerLimit = CouponRequest.builder()
                .usageLimit(5)
                .build();
        assertThrows(BadRequestException.class, () -> couponService.updateCoupon(1L, lowerLimit));
    }
}
