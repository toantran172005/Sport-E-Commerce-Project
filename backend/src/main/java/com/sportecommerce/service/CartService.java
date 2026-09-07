package com.sportecommerce.service;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.AddToCartRequest;
import com.sportecommerce.enums.OtpPurpose;

public interface CartService {
    ApiResponse<Integer> addToCart(Long userId, AddToCartRequest request);
}
