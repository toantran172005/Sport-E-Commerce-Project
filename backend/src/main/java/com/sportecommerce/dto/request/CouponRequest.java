package com.sportecommerce.dto.request;

import com.sportecommerce.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @PositiveOrZero(message = "Giá trị giảm phải lớn hơn hoặc bằng 0")
    private Double discountValue;

    @PositiveOrZero(message = "Đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")
    private Double minOrderAmount;

    @PositiveOrZero(message = "Mức giảm tối đa phải lớn hơn hoặc bằng 0")
    private Double maxDiscountAmount;

    private Integer usageLimit;

    private String startDate;

    private String endDate;

    private Boolean isActive;
}

