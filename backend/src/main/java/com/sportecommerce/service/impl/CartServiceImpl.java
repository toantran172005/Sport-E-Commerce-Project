package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.AddToCartRequest;
import com.sportecommerce.entity.Cart;
import com.sportecommerce.entity.CartItem;
import com.sportecommerce.entity.ProductVariant;
import com.sportecommerce.entity.User;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.CartItemRepository;
import com.sportecommerce.repository.CartRepository;
import com.sportecommerce.repository.ProductVariantRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional
    public ApiResponse<Integer> addToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(()-> new AppException("Khong tim thay User"));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });

        ProductVariant productVariant = productVariantRepository.findById(request.getVariant_id())
                .orElseThrow(()-> new AppException("Khong tim thay Variant ID"));
        if (productVariant.getStock() < request.getQuantity()) {
            throw new AppException("So luong ton kho khong du");
        }

        if (Boolean.FALSE.equals(productVariant.getIsActive())) {
            throw new AppException("San pham nay hien khong con kha dung");
        }

        CartItem cartItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), productVariant.getId())
                .orElse(null);
        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (productVariant.getStock() < newQuantity){
                throw new AppException("So luong ton kho khong du de them tiep");
            }
            cartItem.setQuantity(newQuantity);
            cartItem.setPriceAtAdded(productVariant.getPrice());
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .variant(productVariant)
                    .quantity(request.getQuantity())
                    .priceAtAdded(productVariant.getPrice())
                    .build();
        }

        cartItemRepository.save(cartItem);

        Integer totalItems = cartItemRepository.countTotalItemsById(cart.getId());
        int finalTotal = (totalItems != null) ? totalItems: 0;

        return ApiResponse.success("Them vao gio hang thanh cong", finalTotal);
    }
}
