package com.sportecommerce.repository;

import com.sportecommerce.entity.User;
import com.sportecommerce.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findUserById(Long id);

    // Dung de lay danh sach nhan vien (STAFF) con hoat dong, phuc vu module Notification
    // (thong bao khi co don hang moi).
    List<User> findByRoleAndDeletedAtIsNull(UserRole role);
}
