package com.sportecommerce.repository;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Long user(User user);

    List<Order> getOrdersByUser_Id(Long userId);

    Optional<Order> findByOrderCode(String orderCode);
}

