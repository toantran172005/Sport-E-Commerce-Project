package com.sportecommerce.repository;

import com.sportecommerce.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Danh sach thong bao cua 1 user, moi nhat len truoc, co phan trang
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Dem so thong bao chua doc, dung de hien so badge
    long countByUserIdAndIsReadFalse(Long userId);

    // Lay 1 thong bao kem kiem tra quyen so huu (chi user do moi duoc danh dau da doc)
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    // Danh dau tat ca thong bao chua doc cua 1 user thanh da doc (update hang loat, tranh load het ve app)
    @Modifying
    @Query("update Notification n set n.isRead = true, n.readAt = :readAt " +
            "where n.user.id = :userId and n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId, @Param("readAt") OffsetDateTime readAt);
}
