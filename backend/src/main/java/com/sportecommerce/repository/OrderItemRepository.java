package com.sportecommerce.repository;

import com.sportecommerce.entity.OrderItemRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepositoryRepository extends JpaRepository<OrderItemRepository, Long> {
}
