package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartRequest {
    @NotNull(message = "Variant ID khong duoc de trong")
    private Long variant_id;

    @NotNull(message = "quantity khong duoc de trong")
    @Min(value = 1)
    private Integer quantity;
}
