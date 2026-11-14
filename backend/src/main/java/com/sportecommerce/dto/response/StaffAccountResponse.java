package com.sportecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ket qua Admin tao tai khoan nhan vien: thong tin tai khoan + mat khau mac dinh
 * (chi tra ve cho Admin vua tao de Admin thong bao cho nhan vien).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAccountResponse {

    private UserResponse user;
    private String temporaryPassword;
}
