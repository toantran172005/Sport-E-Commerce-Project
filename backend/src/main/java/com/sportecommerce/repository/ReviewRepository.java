package com.sportecommerce.repository;

import com.sportecommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderItemId(Long orderItemId);
}