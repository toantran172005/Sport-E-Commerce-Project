package com.sportecommerce.repository;

import com.sportecommerce.entity.CartRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepositoryRepository extends JpaRepository<CartRepository, Long> {
}
