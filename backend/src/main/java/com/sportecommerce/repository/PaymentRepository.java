package com.sportecommerce.repository;

import com.sportecommerce.entity.Payment;
import com.sportecommerce.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionCode(String transactionCode);

    Optional<Payment> findByOrder_OrderCode(String orderCode);

    /**
     * Các khoản cần hoàn tiền (status = REFUND). refunded=false: đang chờ hoàn; refunded=true: đã hoàn.
     */
    @Query("SELECT p FROM Payment p JOIN FETCH p.order o JOIN FETCH o.user "
            + "WHERE p.status = :status "
            + "AND ((:refunded = true AND p.refundedAt IS NOT NULL) OR (:refunded = false AND p.refundedAt IS NULL)) "
            + "ORDER BY p.createdAt DESC")
    List<Payment> findRefunds(@Param("status") PaymentStatus status, @Param("refunded") boolean refunded);
}

