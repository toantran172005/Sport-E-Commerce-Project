package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CartItemRequest;
import com.sportecommerce.dto.response.CartItemResponse;
import com.sportecommerce.dto.response.CartResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.CartItemRepository;
import com.sportecommerce.repository.CartRepository;
import com.sportecommerce.repository.ProductVariantRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    private Cart getOrCreateCartEntity(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
            Cart cart = Cart.builder()
                    .user(user)
                    .build();
            return cartRepository.save(cart);
        });
    }

    private CartItemResponse mapToItemResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        Product product = variant.getProduct();

        Double price = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();
        Double originalPrice = variant.getPrice();

        String variantLabel = "";
        if (variant.getSize() != null && variant.getColor() != null) {
            variantLabel = variant.getSize() + " • " + variant.getColor();
        } else if (variant.getSize() != null) {
            variantLabel = variant.getSize();
        } else if (variant.getColor() != null) {
            variantLabel = variant.getColor();
        } else {
            variantLabel = "Tiêu chuẩn";
        }

        String imageUrl = variant.getImageUrl();
        if (imageUrl == null && product != null && product.getProductImages() != null && !product.getProductImages().isEmpty()) {
            imageUrl = product.getProductImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(product.getProductImages().get(0).getImageUrl());
        }

        double subtotal = price * item.getQuantity();

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : "")
                .productSlug(product != null ? product.getSlug() : "")
                .variantId(variant.getId())
                .variant(variantLabel)
                .sku(variant.getSku())
                .price(price)
                .originalPrice(originalPrice)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .imageUrl(imageUrl)
                .stock(variant.getStock())
                .build();
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponse> itemResponses = new ArrayList<>();
        double totalAmount = 0.0;
        int totalQuantity = 0;

        for (CartItem item : items) {
            CartItemResponse res = mapToItemResponse(item);
            itemResponses.add(res);
            totalAmount += res.getSubtotal();
            totalQuantity += res.getQuantity();
        }

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalAmount(totalAmount)
                .totalItems(itemResponses.size())
                .totalQuantity(totalQuantity)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCartEntity(userId);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCartEntity(userId);
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với ID: " + request.getVariantId()));

        if (variant.getStock() != null && variant.getStock() < request.getQuantity()) {
            throw new BadRequestException("Số lượng trong kho không đủ (còn lại: " + variant.getStock() + ")");
        }

        Double price = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (variant.getStock() != null && variant.getStock() < newQuantity) {
                throw new BadRequestException("Số lượng yêu cầu vượt quá tồn kho (tối đa: " + variant.getStock() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .priceAtAdded(price)
                    .build();
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(Long userId, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            ProductVariant variant = item.getVariant();
            if (variant.getStock() != null && variant.getStock() < quantity) {
                throw new BadRequestException("Số lượng yêu cầu vượt quá tồn kho (tối đa: " + variant.getStock() + ")");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long variantId) {
        Cart cart = getOrCreateCartEntity(userId);
        cartItemRepository.deleteByCartIdAndVariantId(cart.getId(), variantId);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeCartItemById(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dòng sản phẩm trong giỏ"));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Dòng sản phẩm không thuộc giỏ hàng này");
        }
        cartItemRepository.delete(item);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCartEntity(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    @Override
    @Transactional
    public CartResponse syncCart(Long userId, List<CartItemRequest> items) {
        Cart cart = getOrCreateCartEntity(userId);
        if (items != null) {
            for (CartItemRequest req : items) {
                if (req.getVariantId() == null) continue;
                ProductVariant variant = productVariantRepository.findById(req.getVariantId()).orElse(null);
                if (variant == null) continue;

                int qty = req.getQuantity() != null && req.getQuantity() > 0 ? req.getQuantity() : 1;
                Double price = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();

                Optional<CartItem> existing = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());
                if (existing.isPresent()) {
                    CartItem it = existing.get();
                    it.setQuantity(it.getQuantity() + qty);
                    cartItemRepository.save(it);
                } else {
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .variant(variant)
                            .quantity(qty)
                            .priceAtAdded(price)
                            .build();
                    cartItemRepository.save(newItem);
                }
            }
        }
        return buildCartResponse(cart);
    }
}
