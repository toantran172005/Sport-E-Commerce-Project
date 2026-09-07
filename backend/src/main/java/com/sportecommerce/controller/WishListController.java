package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishListController {
    private final WishListService wishListService;

    @PostMapping("/{productId}/toggle")
    public ApiResponse<Void> toggleWishList(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        wishListService.addOrRemoveWishList(principal.getId(), productId);
        return ApiResponse.success("Cap nhat thanh cong wishlist", null);
    }
}
