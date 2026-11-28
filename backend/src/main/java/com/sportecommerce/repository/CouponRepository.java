package com.sportecommerce.repository;

import com.sportecommerce.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    List<Coupon> findByIsActiveTrue();

    boolean existsByCode(String code);

    /**
     * Tăng lượt dùng nguyên tử, chỉ khi chưa chạm giới hạn. 0 dòng = đã hết lượt.
     */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Coupon c SET c.usedCount = COALESCE(c.usedCount, 0) + 1 "
            + "WHERE c.id = :id AND (c.usageLimit IS NULL OR COALESCE(c.usedCount, 0) < c.usageLimit)")
    int increaseUsedCountIfAvailable(@Param("id") Long id);

    /** Trả lại 1 lượt dùng (hủy đơn), không để âm. */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Coupon c SET c.usedCount = CASE WHEN COALESCE(c.usedCount, 0) > 0 "
            + "THEN c.usedCount - 1 ELSE 0 END WHERE c.id = :id")
    int decreaseUsedCount(@Param("id") Long id);
}

