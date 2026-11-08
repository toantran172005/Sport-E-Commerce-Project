package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.AttributeRequest;
import com.sportecommerce.dto.response.ProductAttributeResponse;
import com.sportecommerce.service.ProductAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/attributes")
@RequiredArgsConstructor
public class ProductAttributeController {
    private final ProductAttributeService attributeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductAttributeResponse>>> getAll(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thuộc tính sản phẩm thành công", attributeService.getByProduct(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductAttributeResponse>> add(
            @PathVariable Long productId, @Valid @RequestBody AttributeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Thêm thuộc tính thành công", attributeService.add(productId, request)));
    }

    @PutMapping("/{attributeId}")
    public ResponseEntity<ApiResponse<ProductAttributeResponse>> update(
            @PathVariable Long productId, @PathVariable Long attributeId,
            @Valid @RequestBody AttributeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật thuộc tính thành công", attributeService.update(productId, attributeId, request)));
    }

    @DeleteMapping("/{attributeId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long productId, @PathVariable Long attributeId) {
        attributeService.delete(productId, attributeId);
        return ResponseEntity.ok(ApiResponse.success("Xóa thuộc tính thành công", null));
    }
}
