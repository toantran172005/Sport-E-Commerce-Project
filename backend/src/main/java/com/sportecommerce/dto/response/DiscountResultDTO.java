package com.sportecommerce.dto.response;

import com.sportecommerce.enums.DiscountType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountResultDTO {
    private Long couponId;
    private String code;
    private DiscountType discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double newTotal;
    private String message;
}
