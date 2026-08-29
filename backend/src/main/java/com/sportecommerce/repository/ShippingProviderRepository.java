package com.sportecommerce.repository;

import com.sportecommerce.entity.ShippingProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingProviderRepository extends JpaRepository<ShippingProvider, Long> {
}
