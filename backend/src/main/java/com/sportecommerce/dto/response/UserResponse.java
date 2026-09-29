package com.sportecommerce.dto.response;

import com.sportecommerce.entity.User;
import com.sportecommerce.enums.GenderType;
import com.sportecommerce.enums.UserRole;
import com.sportecommerce.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String phoneNumber;
    private String fullName;
    private String avatarUrl;
    private GenderType gender;
    private LocalDate dateOfBirth;
    private UserRole role;
    private UserStatus status;
    private OffsetDateTime emailVerifiedAt;
    private OffsetDateTime phoneVerifiedAt;
    private OffsetDateTime lastLoginAt;
    private OffsetDateTime createdAt;

}
