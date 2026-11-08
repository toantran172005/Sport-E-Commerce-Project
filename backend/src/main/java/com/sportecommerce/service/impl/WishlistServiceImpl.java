package com.sportecommerce.service.impl;

import com.sportecommerce.dto.response.WishlistResponse;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.ProductImage;
import com.sportecommerce.entity.User;
import com.sportecommerce.entity.Wishlist;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.repository.WishlistRepository;
import com.sportecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private WishlistResponse mapToResponse(Wishlist wishlist) {
        Product p = wishlist.getProduct();
        String imageUrl = null;
        if (p.getProductImages() != null && !p.getProductImages().isEmpty()) {
            imageUrl = p.getProductImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(p.getProductImages().get(0).getImageUrl());
        }

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .imageUrl(imageUrl)
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getWishlistProductIds(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(w -> w.getProduct().getId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        Wishlist newWishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(newWishlist);
        return true;
    }

    @Override
    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

            Wishlist newWishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(newWishlist);
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
