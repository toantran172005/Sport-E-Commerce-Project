package com.sportecommerce.service;

import com.sportecommerce.dto.request.CreateStaffRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.StaffAccountResponse;
import com.sportecommerce.dto.response.UserResponse;
import com.sportecommerce.enums.UserRole;

public interface AdminUserService {

    /** Tao tai khoan STAFF voi mat khau mac dinh, bat buoc doi mat khau o lan dang nhap dau. */
    StaffAccountResponse createStaff(CreateStaffRequest request);

    /** Danh sach tai khoan (loc theo vai tro, tu khoa email/ho ten/so dien thoai), moi nhat truoc. */
    PageResponse<UserResponse> getUsers(UserRole role, String keyword, int page, int size);
}
