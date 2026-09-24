package com.sportecommerce.repository;

import com.sportecommerce.entity.Product;
import com.sportecommerce.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySlug(String slug);

    boolean existsByCategory_Id(Long categoryId);

    boolean existsByBrand_Id(Long brandId);

    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findByStatusAndDeletedAtIsNull(ProductStatus status, Pageable pageable);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);
}
