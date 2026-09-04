package com.sportecommerce.repository;

import com.sportecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    User findUserById(Long id);
}

