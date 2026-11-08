package com.sportecommerce.repository;

import com.sportecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.variant.product.id = :productId")
    List<OrderItem> findByUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.variant.product.id = :productId")
    List<OrderItem> findByProductId(@Param("productId") Long productId);
}
