package com.sportecommerce.dto.response;

import com.sportecommerce.enums.DiscountType;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private DiscountType discountType;
    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Instant startDate;
    private Instant endDate;
    private Boolean isActive;
}
