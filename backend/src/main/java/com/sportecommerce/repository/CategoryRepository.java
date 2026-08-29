package com.sportecommerce.repository;

import com.sportecommerce.entity.CategoryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepositoryRepository extends JpaRepository<CategoryRepository, Long> {
}
