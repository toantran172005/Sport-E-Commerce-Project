package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductTagRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductTagRepositoryRepository extends JpaRepository<ProductTagRepository, Long> {
}
