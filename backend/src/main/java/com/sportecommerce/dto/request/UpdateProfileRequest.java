package com.sportecommerce.dto.request;

import com.sportecommerce.enums.GenderType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(max = 150)
    private String fullName;

    private String avatarUrl;

    private GenderType gender;

    private LocalDate dateOfBirth;
}
