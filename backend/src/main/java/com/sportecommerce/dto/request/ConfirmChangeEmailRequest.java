package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class ConfirmChangeEmailRequest {

    @NotBlank
    @Email(message = "Email moi khong hop le")
    private String newEmail;

    @NotBlank
    @Pattern(regexp = "^[0-9]{4,8}$", message = "Ma OTP khong hop le")
    private String otp;
}
