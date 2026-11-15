package com.sportecommerce.service;

import com.sportecommerce.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {
    List<WishlistResponse> getWishlist(Long userId);

    List<Long> getWishlistProductIds(Long userId);

    boolean toggleWishlist(Long userId, Long productId);

    void addToWishlist(Long userId, Long productId);

    void removeFromWishlist(Long userId, Long productId);

    boolean isInWishlist(Long userId, Long productId);
}
