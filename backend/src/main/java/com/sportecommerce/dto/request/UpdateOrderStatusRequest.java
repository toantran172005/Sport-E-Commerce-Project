package com.sportecommerce.dto.request;

import com.sportecommerce.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateOrderStatusRequest {
    @NotNull(message = "OrderId không được trống!")
    private Long orderId;

    @NotNull(message = "Trạng thái cần cập nhật không được trống!")
    private OrderStatus newStatus;

    private String note;
    private String cancelledReason;
}
