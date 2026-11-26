package com.sportecommerce.dto.response;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private Double basePrice;
    private Double salePrice;
    private String imageUrl;
    private Double avgRating;
    private Integer reviewCount;
    private Long defaultVariantId;
    private String defaultVariantSize;
    private String defaultVariantColor;
    private Double defaultVariantPrice;
    private Double defaultVariantSalePrice;
    private Integer defaultVariantStock;
    private Instant createdAt;
}
