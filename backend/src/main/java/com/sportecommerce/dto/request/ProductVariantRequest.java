package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantRequest {
    @NotBlank(message = "SKU không được để trống")
    private String sku;

    private String size;
    private String color;

    @NotNull(message = "price không được để trống")
    @Positive(message = "price phải lớn hơn 0")
    private Double price;

    private Double salePrice;

    @NotNull(message = "stock không được để trống")
    @Min(value = 0, message = "stock không được âm")
    private Integer stock;

    private Integer weightGram;
    private String imageUrl;
}
