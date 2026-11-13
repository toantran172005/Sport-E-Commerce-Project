package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.AddressRequest;
import com.sportecommerce.dto.response.AddressResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Sổ địa chỉ giao hàng của user đang đăng nhập (userId luôn lấy từ JWT, không nhận từ client).
 */
@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(addressService.getMyAddresses(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse created = addressService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm địa chỉ thành công", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        return ApiResponse.success("Cập nhật địa chỉ thành công", addressService.update(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/default")
    public ApiResponse<AddressResponse> setDefault(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success("Đã đặt làm địa chỉ mặc định", addressService.setDefault(principal.getId(), id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        addressService.delete(principal.getId(), id);
        return ApiResponse.success("Đã xóa địa chỉ", null);
    }
}
