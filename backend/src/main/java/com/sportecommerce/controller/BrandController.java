package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.BrandRequest;
import com.sportecommerce.dto.response.BrandResponse;
import com.sportecommerce.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        BrandResponse response = brandService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo thương hiệu thành công", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        BrandResponse response = brandService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thương hiệu thành công", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        brandService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thương hiệu thành công", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAll() {
        List<BrandResponse> response = brandService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thương hiệu thành công", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getById(@PathVariable Long id) {
        BrandResponse response = brandService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết thương hiệu thành công", response));
    }
}
