package com.sportecommerce.repository;

import com.sportecommerce.entity.Product;
import com.sportecommerce.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySlug(String slug);

    /** Cộng số lượng đã bán nguyên tử. */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Product p SET p.soldCount = COALESCE(p.soldCount, 0) + :qty WHERE p.id = :id")
    int increaseSoldCount(@Param("id") Long id, @Param("qty") int qty);

    /** Trừ số lượng đã bán nguyên tử, không để âm. */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Product p SET p.soldCount = CASE WHEN COALESCE(p.soldCount, 0) - :qty < 0 THEN 0 "
            + "ELSE COALESCE(p.soldCount, 0) - :qty END WHERE p.id = :id")
    int decreaseSoldCount(@Param("id") Long id, @Param("qty") int qty);

    boolean existsByCategory_Id(Long categoryId);

    boolean existsByBrand_Id(Long brandId);

    @EntityGraph(attributePaths = {"category", "brand", "productVariants"})
    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    @Override
    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    boolean existsByCategory_IdAndDeletedAtIsNull(Long categoryId);

    boolean existsByBrand_IdAndDeletedAtIsNull(Long brandId);
}
