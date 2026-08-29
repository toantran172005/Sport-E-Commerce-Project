package com.sportecommerce.repository;

import com.sportecommerce.entity.OrderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepositoryRepository extends JpaRepository<OrderRepository, Long> {
}
