package com.sportecommerce.repository;

import com.sportecommerce.entity.Review;
import com.sportecommerce.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductId(Long productId, Pageable pageable);

    Page<Review> findByProductIdAndStatus(Long productId, ReviewStatus status, Pageable pageable);

    List<Review> findByProductIdAndStatus(Long productId, ReviewStatus status);

    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    List<Review> findByStatus(ReviewStatus status);

    boolean existsByOrderItemId(Long orderItemId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = :status")
    Double calculateAverageRating(@Param("productId") Long productId, @Param("status") ReviewStatus status);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.status = :status")
    Integer countReviews(@Param("productId") Long productId, @Param("status") ReviewStatus status);
}
