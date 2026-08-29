package com.sportecommerce.repository;

import com.sportecommerce.entity.ReviewImageRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewImageRepositoryRepository extends JpaRepository<ReviewImageRepository, Long> {
}
