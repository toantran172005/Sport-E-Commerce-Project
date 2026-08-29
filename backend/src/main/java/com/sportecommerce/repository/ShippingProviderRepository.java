package com.sportecommerce.repository;

import com.sportecommerce.entity.ShippingProviderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingProviderRepositoryRepository extends JpaRepository<ShippingProviderRepository, Long> {
}
