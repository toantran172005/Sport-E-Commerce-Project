package com.sportecommerce.repository;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    boolean existsByShippingAddress_Id(Long addressId);
}

