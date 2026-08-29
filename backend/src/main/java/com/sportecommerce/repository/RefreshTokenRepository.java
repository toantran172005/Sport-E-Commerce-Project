package com.sportecommerce.repository;

import com.sportecommerce.entity.RefreshTokenRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepositoryRepository extends JpaRepository<RefreshTokenRepository, Long> {
}
