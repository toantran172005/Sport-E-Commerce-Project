package com.sportecommerce.service;

import com.sportecommerce.dto.request.CartItemRequest;
import com.sportecommerce.dto.response.CartResponse;

import java.util.List;

public interface CartService {
    CartResponse getCart(Long userId);

    CartResponse addToCart(Long userId, CartItemRequest request);

    CartResponse updateQuantity(Long userId, Long variantId, Integer quantity);

    CartResponse removeItem(Long userId, Long variantId);

    CartResponse removeCartItemById(Long userId, Long cartItemId);

    void clearCart(Long userId);

    CartResponse syncCart(Long userId, List<CartItemRequest> items);
}
