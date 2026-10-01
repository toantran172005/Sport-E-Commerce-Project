package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    boolean existsByProduct_IdAndTag_Id(Long productId, Long tagId);

    void deleteByProduct_Id(Long productId);
}
