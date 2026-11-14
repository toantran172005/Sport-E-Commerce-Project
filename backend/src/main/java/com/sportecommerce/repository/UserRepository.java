package com.sportecommerce.repository;

import com.sportecommerce.entity.User;
import com.sportecommerce.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findUserById(Long id);

    // Dung de lay danh sach nhan vien (STAFF) con hoat dong, phuc vu module Notification
    // (thong bao khi co don hang moi).
    List<User> findByRoleAndDeletedAtIsNull(UserRole role);

    // Kiem tra trung email khong phan biet hoa/thuong (dung khi Admin tao tai khoan nhan vien)
    boolean existsByEmailIgnoreCase(String email);

    // Tim kiem tai khoan cho trang quan tri: loc theo vai tro + tu khoa (email / ho ten / so dien thoai).
    // pattern da duoc chuan hoa dang "%tu khoa viet thuong%" o tang service.
    @Query("""
            SELECT u FROM User u
            WHERE u.deletedAt IS NULL
              AND u.role IN :roles
              AND (LOWER(u.email) LIKE :pattern
                   OR LOWER(u.fullName) LIKE :pattern
                   OR COALESCE(u.phoneNumber, '') LIKE :pattern)
            """)
    Page<User> searchUsers(@Param("roles") Collection<UserRole> roles,
                           @Param("pattern") String pattern,
                           Pageable pageable);
}
