package com.sportecommerce.dto.request;

import com.sportecommerce.enums.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResendOtpRequest {

    @NotBlank
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotNull(message = "Mục đích xác thực OTP không được để trống")
    private OtpPurpose purpose;
}
