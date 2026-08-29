package com.sportecommerce.repository;

import com.sportecommerce.entity.BrandRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepositoryRepository extends JpaRepository<BrandRepository, Long> {
}
