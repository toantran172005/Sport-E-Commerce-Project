package com.sportecommerce.repository;

import com.sportecommerce.entity.OrderStatusHistoryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderStatusHistoryRepositoryRepository extends JpaRepository<OrderStatusHistoryRepository, Long> {
}
