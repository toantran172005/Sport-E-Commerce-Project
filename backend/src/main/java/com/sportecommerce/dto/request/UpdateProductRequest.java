package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {
    @NotNull(message = "category_id không được để trống")
    private Long categoryId;

    private Long brandId;

    @NotBlank(message = "name không được để trống")
    private String name;

    private String description;
    private String sportType;

    @NotNull(message = "base_price không được để trống")
    @Positive(message = "base_price phải lớn hơn 0")
    private Double basePrice;

    private Double salePrice;
}
