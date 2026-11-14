package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CreateStaffRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.StaffAccountResponse;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.entity.User;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.enums.UserStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.AdminUserService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MapperUtil mapperUtil;

    // Mat khau mac dinh cho nhan vien moi; co the doi bang thuoc tinh app.staff.default-password
    @Value("${app.staff.default-password:11111}")
    private String defaultStaffPassword;

    @Override
    @Transactional
    public StaffAccountResponse createStaff(CreateStaffRequest request) {
        String email = request.getEmail().trim();
        String phone = blankToNull(request.getPhoneNumber());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException("Email này đã được đăng ký", HttpStatus.CONFLICT);
        }
        if (phone != null && userRepository.existsByPhoneNumber(phone)) {
            throw new AppException("Số điện thoại này đã được sử dụng", HttpStatus.CONFLICT);
        }

        User staff = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(defaultStaffPassword))
                .fullName(request.getFullName().trim())
                .phoneNumber(phone)
                .role(UserRole.STAFF)
                .status(UserStatus.ACTIVE)
                .mustChangePassword(true)
                .build();

        User saved = userRepository.save(staff);

        return StaffAccountResponse.builder()
                .user(mapperUtil.mapToUserResponse(saved))
                .temporaryPassword(defaultStaffPassword)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(UserRole role, String keyword, int page, int size) {
        Collection<UserRole> roles = (role != null) ? List.of(role) : List.of(UserRole.values());
        String normalized = (keyword == null) ? "" : keyword.trim().toLowerCase();
        String pattern = "%" + normalized + "%";

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<UserResponse> result = userRepository.searchUsers(roles, pattern, pageable)
                .map(mapperUtil::mapToUserResponse);
        return PageResponse.fromPage(result);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
