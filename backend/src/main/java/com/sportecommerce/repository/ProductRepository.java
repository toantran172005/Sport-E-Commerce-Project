package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepositoryRepository extends JpaRepository<ProductRepository, Long> {
}
