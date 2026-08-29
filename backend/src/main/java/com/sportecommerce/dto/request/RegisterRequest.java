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
public class RegisterRequest {

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong hop le")
    private String email;

    @NotBlank(message = "Mat khau khong duoc de trong")
    @Size(min = 8, max = 100, message = "Mat khau phai co it nhat 8 ky tu")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Mat khau phai chua ca chu va so"
    )
    private String password;

    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(max = 150)
    private String fullName;

    @Pattern(regexp = "^$|^[0-9]{9,15}$", message = "So dien thoai khong hop le")
    private String phoneNumber;
}
