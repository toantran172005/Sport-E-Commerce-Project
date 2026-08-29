package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductVariantRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepositoryRepository extends JpaRepository<ProductVariantRepository, Long> {
}
