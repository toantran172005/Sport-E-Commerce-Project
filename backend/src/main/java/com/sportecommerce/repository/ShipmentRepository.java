package com.sportecommerce.repository;

import com.sportecommerce.entity.ShipmentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipmentRepositoryRepository extends JpaRepository<ShipmentRepository, Long> {
}
