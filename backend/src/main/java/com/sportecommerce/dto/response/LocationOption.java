package com.sportecommerce.dto.response;

import java.util.List;

/**
 * Một lựa chọn trong danh mục địa điểm (Tỉnh/Thành, Quận/Huyện, Phường/Xã) lấy từ Giao Hàng Nhanh.
 * id là chuỗi vì mã Phường/Xã của GHN cũ là chuỗi còn các id khác là số.
 */
public record LocationOption(String id, String name, List<String> aliases) {
}
