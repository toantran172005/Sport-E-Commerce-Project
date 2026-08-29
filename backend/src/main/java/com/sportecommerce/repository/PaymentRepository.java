package com.sportecommerce.repository;

import com.sportecommerce.entity.PaymentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepositoryRepository extends JpaRepository<PaymentRepository, Long> {
}
