package com.sportecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {
    private Long id;
    private String sku;
    private String size;
    private String color;
    private Double price;
    private Double salePrice;
    private Integer stock;
    private Boolean isActive;
    private String imageUrl;
}
