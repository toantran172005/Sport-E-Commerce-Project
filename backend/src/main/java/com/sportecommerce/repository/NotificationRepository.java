package com.sportecommerce.repository;

import com.sportecommerce.entity.NotificationRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepositoryRepository extends JpaRepository<NotificationRepository, Long> {
}
