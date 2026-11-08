package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.TagResponse;
import com.sportecommerce.service.ProductTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/tags")
@RequiredArgsConstructor
public class ProductTagController {
    private final ProductTagService productTagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getTags(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy tag của sản phẩm thành công", productTagService.getTagsOfProduct(productId)));
    }

    @PostMapping("/{tagId}")
    public ResponseEntity<ApiResponse<TagResponse>> attach(
            @PathVariable Long productId, @PathVariable Long tagId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Gắn tag thành công", productTagService.attach(productId, tagId)));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<ApiResponse<Void>> detach(
            @PathVariable Long productId, @PathVariable Long tagId) {
        productTagService.detach(productId, tagId);
        return ResponseEntity.ok(ApiResponse.success("Gỡ tag thành công", null));
    }
}
