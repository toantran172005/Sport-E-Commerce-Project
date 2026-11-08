package com.sportecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id; // CartItem ID in DB
    private Long productId;
    private String productName;
    private String productSlug;
    private Long variantId;
    private String variant; // e.g. "Size 42 • Xanh Dương"
    private String sku;
    private Double price;
    private Double originalPrice;
    private Integer quantity;
    private Double subtotal;
    private String imageUrl;
    private Integer stock;
}
