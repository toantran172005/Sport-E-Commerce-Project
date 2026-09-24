package com.sportecommerce.repository;

import com.sportecommerce.entity.Product;
import com.sportecommerce.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySlug(String slug);

    boolean existsByCategory_Id(Long categoryId);

    boolean existsByBrand_Id(Long brandId);

    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findByStatusAndDeletedAtIsNull(ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> findProductsWithFilter(
            @Param("status") ProductStatus status,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("keyword") String keyword,
            Pageable pageable);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);
}
