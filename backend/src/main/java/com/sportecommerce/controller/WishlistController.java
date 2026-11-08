package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.WishlistResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    private Long resolveUserId(UserPrincipal userPrincipal, Long fallbackUserId) {
        if (userPrincipal != null) {
            return userPrincipal.getId();
        }
        if (fallbackUserId != null) {
            return fallbackUserId;
        }
        return 4L;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        List<WishlistResponse> response = wishlistService.getWishlist(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu thích thành công", response));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getWishlistProductIds(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        List<Long> response = wishlistService.getWishlistProductIds(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ID yêu thích thành công", response));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        boolean added = wishlistService.toggleWishlist(resolvedId, productId);
        String msg = added ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích";
        return ResponseEntity.ok(ApiResponse.success(msg, Map.of("added", added)));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleWishlistAlias(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId) {
        return toggleWishlist(userPrincipal, productId, userId);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        wishlistService.removeFromWishlist(resolvedId, productId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa khỏi danh sách yêu thích", null));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        boolean inWishlist = wishlistService.isInWishlist(resolvedId, productId);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra yêu thích thành công", Map.of("inWishlist", inWishlist)));
    }
}
