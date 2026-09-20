package com.sportecommerce.repository;

import com.sportecommerce.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    boolean existsByCouponIdAndUserId(Long id, Long userId);
    void deleteByOrder_Id(Long orderId);
}
