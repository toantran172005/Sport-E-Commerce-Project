package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    boolean existsBySku(String sku);
    List<ProductVariant> findBySku(String sku);
    List<ProductVariant> findByProduct_Id(Long productId);
}
