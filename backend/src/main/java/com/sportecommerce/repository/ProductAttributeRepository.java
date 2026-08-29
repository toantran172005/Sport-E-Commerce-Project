package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductAttributeRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductAttributeRepositoryRepository extends JpaRepository<ProductAttributeRepository, Long> {
}
