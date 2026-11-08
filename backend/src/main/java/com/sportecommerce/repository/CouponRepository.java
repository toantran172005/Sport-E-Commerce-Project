package com.sportecommerce.repository;

import com.sportecommerce.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    List<Coupon> findByIsActiveTrue();

    boolean existsByCode(String code);
}

