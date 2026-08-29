package com.sportecommerce.repository;

import com.sportecommerce.entity.UserAddressRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAddressRepositoryRepository extends JpaRepository<UserAddressRepository, Long> {
}
