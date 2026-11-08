package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductTag;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    boolean existsByProduct_IdAndTag_Id(Long productId, Long tagId);
    boolean existsByTag_Id(Long tagId);
    Optional<ProductTag> findByProduct_IdAndTag_Id(Long productId, Long tagId);

    @EntityGraph(attributePaths = {"tag"})
    List<ProductTag> findByProduct_Id(Long productId);
    void deleteByProduct_Id(Long productId);
}
