package com.sportecommerce.repository;

import com.sportecommerce.entity.CartItem;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndVariantId(Long cartid, Long variantId);

    @Query("SELECT SUM(c.quantity) FROM CartItem c WHERE c.cart.id = :cartId")
    Integer countTotalItemsById(@Param("cartId") Long cartId);
}
