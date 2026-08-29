package com.sportecommerce.repository;

import com.sportecommerce.entity.WishlistRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepositoryRepository extends JpaRepository<WishlistRepository, Long> {
}
