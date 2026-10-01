package com.sportecommerce.dto.response;

import com.sportecommerce.enums.ProductStatus;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String name;
    private String slug;
    private String description;
    private String sportType;
    private ProductStatus status;
    private Double basePrice;
    private Double salePrice;
    private Boolean isFeatured;
    private Double avgRating;
    private Integer reviewCount;
    private Integer soldCount;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
    private Instant createdAt;
}
