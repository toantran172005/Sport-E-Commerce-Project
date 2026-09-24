package com.sportecommerce.repository;

import com.sportecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsBySlug(String slug);

    List<Category> findBySlug(String slug);

    List<Category> findByIsActiveTrue();

    boolean existsByParent_Id(Long parentId);
}
