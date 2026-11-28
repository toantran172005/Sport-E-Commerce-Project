package com.sportecommerce.dto.request;

import com.sportecommerce.enums.AddressScheme;
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
public class AddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 150, message = "Tên người nhận tối đa 150 ký tự")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{9,15}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String addressLine;

    @Size(max = 100, message = "Phường/Xã tối đa 100 ký tự")
    private String ward;

    @Size(max = 100, message = "Quận/Huyện tối đa 100 ký tự")
    private String district;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100, message = "Tỉnh/Thành phố tối đa 100 ký tự")
    private String city;

    /** OLD (Tỉnh > Quận > Phường) hoặc NEW (Tỉnh > Phường). Null = OLD để tương thích client cũ. */
    private AddressScheme addressScheme;

    /** ID Tỉnh/Thành theo danh mục GHN (bắt buộc với địa chỉ NEW). */
    private Integer ghnProvinceId;

    /** ID Quận/Huyện theo danh mục GHN cũ (chỉ OLD). */
    private Integer ghnDistrictId;

    /** Mã Phường/Xã theo danh mục GHN (bắt buộc với địa chỉ NEW). */
    @Size(max = 20, message = "Mã Phường/Xã không hợp lệ")
    private String ghnWardCode;

    /** null = giữ nguyên (khi cập nhật) / false (khi tạo, trừ địa chỉ đầu tiên luôn là mặc định). */
    private Boolean isDefault;
}
