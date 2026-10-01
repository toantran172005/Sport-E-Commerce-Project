package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotNull(message = "Tổng giá trị đơn hàng không được để trống")
    @PositiveOrZero(message = "Tổng giá trị đơn hàng phải lớn hơn hoặc bằng 0")
    private Double orderAmount;
}
