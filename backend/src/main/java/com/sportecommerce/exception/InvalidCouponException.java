package com.sportecommerce.exception;

public class InvalidCouponException extends BadRequestException {
    public InvalidCouponException(String message) {
        super(message);
    }
}
