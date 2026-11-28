package com.sportecommerce.repository;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Long user(User user);

    List<Order> getOrdersByUser_Id(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.shippingAddress " +
            "LEFT JOIN FETCH o.shipment s " +
            "LEFT JOIN FETCH s.provider " +
            "LEFT JOIN FETCH o.payment " +
            "ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetails();

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.shippingAddress " +
            "LEFT JOIN FETCH o.shipment s " +
            "LEFT JOIN FETCH s.provider " +
            "LEFT JOIN FETCH o.payment " +
            "WHERE o.user.id = :userId " +
            "ORDER BY o.createdAt DESC")
    List<Order> findMyOrdersWithDetails(@Param("userId") Long userId);

    Optional<Order> findByOrderCode(String orderCode);

    /**
     * Đọc đơn kèm khóa ghi (SELECT ... FOR UPDATE). Dùng khi đổi trạng thái / xử lý webhook
     * để hai thao tác đồng thời trên cùng một đơn phải xếp hàng, tránh hoàn kho 2 lần.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeForUpdate(@Param("orderCode") String orderCode);

    /**
     * Đơn thanh toán online còn PENDING, chưa thanh toán và tạo trước mốc {@code cutoff}.
     */
    @Query("SELECT o FROM Order o LEFT JOIN o.payment p "
            + "WHERE o.status = :orderStatus "
            + "AND (p IS NULL OR (p.method <> :cod AND p.status IN :payStatuses)) "
            + "AND o.createdAt < :cutoff ORDER BY o.createdAt ASC")
    List<Order> findExpiredUnpaidOrders(@Param("orderStatus") OrderStatus orderStatus,
                                        @Param("cod") PaymentMethod cod,
                                        @Param("payStatuses") Collection<PaymentStatus> payStatuses,
                                        @Param("cutoff") Instant cutoff,
                                        Pageable pageable);

    boolean existsByShippingAddress_Id(Long addressId);
}

