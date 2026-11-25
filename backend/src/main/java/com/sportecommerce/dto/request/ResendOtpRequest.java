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

    /** Chuẩn hoá email (bỏ khoảng trắng, viết thường) để đăng ký / đăng nhập / OTP luôn khớp nhau. */
    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    @NotNull(message = "Mục đích xác thực OTP không được để trống")
    private OtpPurpose purpose;
}
