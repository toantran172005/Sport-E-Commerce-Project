package com.sportecommerce.dto.request;

import com.sportecommerce.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    @NotNull(message = "OrderId không được để trống!")
    private Long orderId;

    @NotNull(message = "Trạng thái cần cập nhật không được để trống!")
    private OrderStatus newStatus;

    private String note;
    private String cancelledReason;
}
