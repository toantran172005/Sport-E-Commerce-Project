package com.sportecommerce.repository;

import com.sportecommerce.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    boolean existsByCouponIdAndUserId(Long id, Long userId);

    Optional<CouponUsage> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
    void deleteByOrder_Id(Long orderId);
}

