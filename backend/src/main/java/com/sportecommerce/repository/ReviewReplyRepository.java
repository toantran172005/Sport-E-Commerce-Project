package com.sportecommerce.repository;

import com.sportecommerce.entity.ReviewReplyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewReplyRepositoryRepository extends JpaRepository<ReviewReplyRepository, Long> {
}
