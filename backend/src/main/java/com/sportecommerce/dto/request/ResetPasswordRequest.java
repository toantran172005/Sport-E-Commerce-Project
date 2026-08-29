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
    @Email(message = "Email khong hop le")
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]{4,8}$", message = "Ma OTP khong hop le")
    private String otp;

    @NotBlank
    @Size(min = 8, max = 100, message = "Mat khau phai co it nhat 8 ky tu")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Mat khau phai chua ca chu va so"
    )
    private String newPassword;
}
