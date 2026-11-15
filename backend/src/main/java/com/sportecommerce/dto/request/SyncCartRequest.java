package com.sportecommerce.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncCartRequest {
    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    @Valid
    private List<CartItemRequest> items;
}
