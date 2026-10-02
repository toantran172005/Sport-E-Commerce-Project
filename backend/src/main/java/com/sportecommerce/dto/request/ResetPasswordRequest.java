package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class ResetPasswordRequest {

    @NotBlank
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]{4,8}$", message = "Mã OTP không hợp lệ")
    private String otp;

    @NotBlank
    @Size(min = 8, max = 100, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Mật khẩu phải chứa cả chữ và số"
    )
    private String newPassword;
}
