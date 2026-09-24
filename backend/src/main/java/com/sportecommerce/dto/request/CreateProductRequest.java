package com.sportecommerce.dto.request;

import com.sportecommerce.enums.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {
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

    private ProductStatus status;

    @NotEmpty(message = "Sản phẩm phải có ít nhất 1 biến thể (variant)")
    @Valid
    private List<ProductVariantRequest> variants;

    @Valid
    private List<ProductImageRequest> images;
}
