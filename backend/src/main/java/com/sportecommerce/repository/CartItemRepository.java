package com.sportecommerce.repository;

import com.sportecommerce.entity.CartItemRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepositoryRepository extends JpaRepository<CartItemRepository, Long> {
}
