package com.sportecommerce.enums;

/**
 * Mô hình địa chỉ hành chính.
 * OLD: Tỉnh/Thành > Quận/Huyện > Phường/Xã (trước 01/07/2025).
 * NEW: Tỉnh/Thành > Phường/Xã (không còn cấp Quận/Huyện).
 */
public enum AddressScheme {
    OLD,
    NEW
}
