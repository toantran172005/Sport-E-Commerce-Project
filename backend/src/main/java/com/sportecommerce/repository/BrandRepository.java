package com.sportecommerce.repository;

import com.sportecommerce.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsBySlug(String slug);
    boolean existsByName(String name);
    Optional<Brand> findBySlug(String slug);
    List<Brand> findByIsActiveTrue();
}
