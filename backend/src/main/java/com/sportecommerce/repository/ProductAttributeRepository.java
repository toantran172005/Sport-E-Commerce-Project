package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductAttributes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAttributeRepository extends JpaRepository<ProductAttributes, Long> {
    List<ProductAttributes> findByProduct_Id(Long productId);

    void deleteByProduct_Id(Long productId);
}
