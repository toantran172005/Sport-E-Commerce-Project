package com.sportecommerce.dto.response;

import com.sportecommerce.enums.ProductStatus;
import lombok.*;

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
    private String categoryName;
    private String brandName;
    private String primaryImageUrl;
    private Double avgRating;
    private Integer reviewCount;
    private Boolean isFeatured;
    private Integer totalStock;
    private Integer variantCount;
    private String primarySku;
    private Integer soldCount;
    private Long categoryId;
    private Long brandId;
}
