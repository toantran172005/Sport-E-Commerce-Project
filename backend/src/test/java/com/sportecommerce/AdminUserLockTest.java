package com.sportecommerce;

import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.entity.RefreshToken;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.enums.UserStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.RefreshTokenRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.security.CustomUserDetailsService;
import com.sportecommerce.service.impl.AdminUserServiceImpl;
import com.sportecommerce.util.MapperUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Kiem thu khoa / mo khoa tai khoan nhan vien (TC-M4-20). */
@ExtendWith(MockitoExtension.class)
class AdminUserLockTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private MapperUtil mapperUtil;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private CustomUserDetailsService userDetailsService;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    private User user(long id, UserRole role, UserStatus status) {
        return User.builder().id(id).email("u" + id + "@mail.com").fullName("User " + id)
                .role(role).status(status).build();
    }

    @Test
    @DisplayName("Khoa STAFF dang hoat dong: status = LOCKED va thu hoi moi refresh token")
    void lockActiveStaffShouldLockAndRevokeTokens() {
        User staff = user(2, UserRole.STAFF, UserStatus.ACTIVE);
        RefreshToken t1 = RefreshToken.builder().id(1L).user(staff).build();
        RefreshToken t2 = RefreshToken.builder().id(2L).user(staff).build();
        when(userRepository.findUserById(2L)).thenReturn(Optional.of(staff));
        when(userRepository.save(staff)).thenReturn(staff);
        when(refreshTokenRepository.findAllByUserAndRevokedAtIsNull(staff)).thenReturn(List.of(t1, t2));
        when(mapperUtil.mapToUserResponse(staff)).thenReturn(UserResponse.builder().id(2L).status(UserStatus.LOCKED).build());

        UserResponse res = adminUserService.lockStaff(1L, 2L);

        assertEquals(UserStatus.LOCKED, staff.getStatus());
        assertEquals(UserStatus.LOCKED, res.getStatus());
        assertNotNull(t1.getRevokedAt());
        assertNotNull(t2.getRevokedAt());
        verify(refreshTokenRepository).saveAll(List.of(t1, t2));
    }

    @Test
    @DisplayName("Khong duoc tu khoa chinh minh")
    void lockSelfShouldBeRejected() {
        AppException ex = assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Khong khoa duoc ADMIN hoac CUSTOMER qua API nay")
    void lockNonStaffShouldBeRejected() {
        when(userRepository.findUserById(5L)).thenReturn(Optional.of(user(5, UserRole.CUSTOMER, UserStatus.ACTIVE)));
        when(userRepository.findUserById(6L)).thenReturn(Optional.of(user(6, UserRole.ADMIN, UserStatus.ACTIVE)));

        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 5L)).getStatus());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 6L)).getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Khoa tai khoan da bi khoa -> 409, khong thay doi gi")
    void lockAlreadyLockedShouldReturnConflict() {
        when(userRepository.findUserById(2L)).thenReturn(Optional.of(user(2, UserRole.STAFF, UserStatus.LOCKED)));

        AppException ex = assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 2L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Khoa tai khoan khong ton tai hoac da xoa -> 404")
    void lockMissingOrDeletedShouldReturn404() {
        User deleted = user(3, UserRole.STAFF, UserStatus.ACTIVE);
        deleted.setDeletedAt(java.time.OffsetDateTime.now());
        when(userRepository.findUserById(99L)).thenReturn(Optional.empty());
        when(userRepository.findUserById(3L)).thenReturn(Optional.of(deleted));

        assertEquals(HttpStatus.NOT_FOUND, assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 99L)).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(AppException.class, () -> adminUserService.lockStaff(1L, 3L)).getStatus());
    }

    @Test
    @DisplayName("Mo khoa STAFF dang bi khoa: status = ACTIVE")
    void unlockLockedStaffShouldActivate() {
        User staff = user(2, UserRole.STAFF, UserStatus.LOCKED);
        when(userRepository.findUserById(2L)).thenReturn(Optional.of(staff));
        when(userRepository.save(staff)).thenReturn(staff);
        when(mapperUtil.mapToUserResponse(staff)).thenReturn(UserResponse.builder().id(2L).status(UserStatus.ACTIVE).build());

        UserResponse res = adminUserService.unlockStaff(2L);

        assertEquals(UserStatus.ACTIVE, staff.getStatus());
        assertEquals(UserStatus.ACTIVE, res.getStatus());
    }

    @Test
    @DisplayName("Mo khoa tai khoan khong bi khoa -> 409")
    void unlockActiveStaffShouldReturnConflict() {
        when(userRepository.findUserById(2L)).thenReturn(Optional.of(user(2, UserRole.STAFF, UserStatus.ACTIVE)));

        AppException ex = assertThrows(AppException.class, () -> adminUserService.unlockStaff(2L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        verify(userRepository, never()).save(any());
    }
}
