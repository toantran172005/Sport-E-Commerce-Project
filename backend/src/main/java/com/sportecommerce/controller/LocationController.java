package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.LocationOption;
import com.sportecommerce.enums.AddressScheme;
import com.sportecommerce.service.impl.GhnLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Danh mục địa điểm cho ô chọn địa chỉ (cần đăng nhập). Dữ liệu lấy từ Giao Hàng Nhanh và có lưu đệm 24 giờ.
 */
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final GhnLocationService locationService;

    @GetMapping("/provinces")
    public ApiResponse<List<LocationOption>> provinces(@RequestParam(defaultValue = "NEW") AddressScheme scheme) {
        return ApiResponse.success(locationService.provinces(scheme));
    }

    @GetMapping("/districts")
    public ApiResponse<List<LocationOption>> districts(@RequestParam int provinceId) {
        return ApiResponse.success(locationService.districts(provinceId));
    }

    @GetMapping("/wards")
    public ApiResponse<List<LocationOption>> wards(
            @RequestParam(defaultValue = "NEW") AddressScheme scheme,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer districtId) {
        return ApiResponse.success(locationService.wards(scheme, provinceId, districtId));
    }
}
