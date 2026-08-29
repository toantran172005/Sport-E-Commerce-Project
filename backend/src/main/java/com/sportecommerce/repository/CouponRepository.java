package com.sportecommerce.repository;

import com.sportecommerce.entity.CouponRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponRepositoryRepository extends JpaRepository<CouponRepository, Long> {
}
