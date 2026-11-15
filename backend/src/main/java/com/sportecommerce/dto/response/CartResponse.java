package com.sportecommerce.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private Double totalAmount;
    private Integer totalItems;
    private Integer totalQuantity;
}
