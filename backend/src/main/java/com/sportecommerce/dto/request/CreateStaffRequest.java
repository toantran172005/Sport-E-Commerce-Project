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

/**
 * Admin tao tai khoan nhan vien (STAFF). Khong co truong password/role:
 * mat khau la mat khau mac dinh cua he thong, role luon la STAFF.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStaffRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 150, message = "Họ tên tối đa 150 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    /** Chuẩn hoá email (bỏ khoảng trắng, viết thường) để đăng ký / đăng nhập / OTP luôn khớp nhau. */
    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    @Pattern(regexp = "^$|^[0-9]{9,15}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
}
