package com.sportecommerce.service.impl;

import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.User;
import com.sportecommerce.entity.Wishlist;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.repository.WishlistRepository;
import com.sportecommerce.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class WishListServiceImpl implements WishListService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;


    @Override
    @Transactional
    public void addOrRemoveWishList(Long userId, Long productId) {
        boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, productId);
        if (exists) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(()-> new AppException("Khong tim thay nguoi dung"));
            Product product = productRepository.findById(productId)
                    .orElseThrow(()-> new AppException("Khong tim thay san pham"));

            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
        }
    }
}
