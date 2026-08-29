package com.sportecommerce.repository;

import com.sportecommerce.entity.ReviewRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepositoryRepository extends JpaRepository<ReviewRepository, Long> {
}
