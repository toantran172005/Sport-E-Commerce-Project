package com.sportecommerce.repository;

import com.sportecommerce.entity.CouponUsageRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepositoryRepository extends JpaRepository<CouponUsageRepository, Long> {
}
