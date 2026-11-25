package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class ChangeEmailRequest {

    @NotBlank
    @Email(message = "Email mới không hợp lệ")
    private String newEmail;

    /** Chuẩn hoá email (bỏ khoảng trắng, viết thường) để đăng ký / đăng nhập / OTP luôn khớp nhau. */
    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail == null ? null : newEmail.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
