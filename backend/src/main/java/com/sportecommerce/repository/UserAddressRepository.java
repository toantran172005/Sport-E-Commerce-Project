package com.sportecommerce.repository;

import com.sportecommerce.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    /** Địa chỉ mặc định lên đầu, sau đó mới nhất trước. */
    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);
}
