package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CartItemRequest;
import com.sportecommerce.dto.request.SyncCartRequest;
import com.sportecommerce.dto.request.UpdateCartItemRequest;
import com.sportecommerce.dto.response.CartResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private Long resolveUserId(UserPrincipal userPrincipal, Long fallbackUserId) {
        if (userPrincipal != null) {
            return userPrincipal.getId();
        }
        if (fallbackUserId != null) {
            return fallbackUserId;
        }
        return 4L; // Default customer id fallback
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.getCart(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Lấy giỏ hàng thành công", response));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody CartItemRequest request) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.addToCart(resolvedId, request);
        return ResponseEntity.ok(ApiResponse.success("Thêm vào giỏ hàng thành công", response));
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.updateQuantity(resolvedId, variantId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật số lượng thành công", response));
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @PathVariable Long variantId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.removeItem(resolvedId, variantId);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm khỏi giỏ hàng thành công", response));
    }

    @DeleteMapping("/items/id/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItemById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @PathVariable Long cartItemId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.removeCartItemById(resolvedId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm khỏi giỏ hàng thành công", response));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        cartService.clearCart(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Đã làm trống giỏ hàng", null));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartResponse>> syncCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody SyncCartRequest request) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        CartResponse response = cartService.syncCart(resolvedId, request.getItems());
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ giỏ hàng thành công", response));
    }
}
