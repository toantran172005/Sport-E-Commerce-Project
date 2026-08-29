package com.sportecommerce.enums;

/**
 * Muc dich cua ma OTP. Khong luu trong database (theo thiet ke), chi dung
 * lam mot phan cua Redis key va payload logic nghiep vu.
 */
public enum OtpPurpose {
    REGISTER,
    RESET_PASSWORD,
    CHANGE_EMAIL,
    CHANGE_PHONE
}
