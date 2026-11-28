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
    Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findUserById(Long id);

    List<User> findByRoleAndDeletedAtIsNull(UserRole role);

    boolean existsByEmailIgnoreCase(String email);

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
