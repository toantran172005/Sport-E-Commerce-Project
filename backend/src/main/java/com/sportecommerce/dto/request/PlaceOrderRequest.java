package com.sportecommerce.dto.request;

import com.sportecommerce.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceOrderRequest {
    @NotNull(message = "Vui lòng chọn địa chỉ giao hàng")
    private Long shippingAddressId;

    private List<Long> cartItemIds;

    @Valid
    private List<OrderItemRequest> items;

    private Long couponId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    private String note;
}
