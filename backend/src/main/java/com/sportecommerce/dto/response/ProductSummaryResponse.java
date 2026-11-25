package com.sportecommerce.dto.response;

import com.sportecommerce.enums.ProductStatus;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private ProductStatus status;
    private Double basePrice;
    private Double salePrice;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String primaryImageUrl;
    private Double avgRating;
    private Integer reviewCount;
    private Integer soldCount;
    private Integer stock;
    private Boolean isFeatured;
    private Integer totalStock;
    private Integer variantCount;
    private String primarySku;
    private List<ProductVariantResponse> variants;
}
