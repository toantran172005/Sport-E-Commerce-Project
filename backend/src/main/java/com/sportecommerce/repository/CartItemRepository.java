package com.sportecommerce.repository;

import com.sportecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    void deleteByCartIdAndVariantId(Long cartId, Long variantId);
    void deleteByCartId(Long cartId);
}
