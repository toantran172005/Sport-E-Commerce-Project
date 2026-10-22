package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductAttributes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductAttributesRepository extends JpaRepository<ProductAttributes, Long> {
    List<ProductAttributes> findByProduct_Id(Long productId);
    Optional<ProductAttributes> findByIdAndProduct_Id(Long id, Long productId);
    boolean existsByProduct_IdAndAttributeNameIgnoreCase(Long productId, String attributeName);
    void deleteByProduct_Id(Long productId);
}
