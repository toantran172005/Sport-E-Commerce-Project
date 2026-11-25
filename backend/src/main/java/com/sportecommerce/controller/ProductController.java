package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.CreateProductRequest;
import com.sportecommerce.dto.request.UpdateProductRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.ProductResponse;
import com.sportecommerce.dto.response.ProductSummaryResponse;
import com.sportecommerce.enums.ProductStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.FileStorageService;
import com.sportecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Vui lòng chọn tệp ảnh hợp lệ", HttpStatus.BAD_REQUEST);
        }
        try {
            String publicId = "products/" + UUID.randomUUID();
            FileStorageService.StoredFile stored = fileStorageService.uploadImage(file.getBytes(), publicId);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên Cloudinary thành công", stored.url()));
        } catch (IOException e) {
            throw new AppException("Không đọc được dữ liệu ảnh tải lên", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm thành công", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @PathVariable Long id, @RequestParam ProductStatus status) {
        ProductResponse response = productService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái sản phẩm thành công", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getAll(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double rating,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (status != null && status != ProductStatus.ACTIVE
                && (userPrincipal == null || !userPrincipal.isStaff())) {
            throw new AppException("Bạn không có quyền xem sản phẩm ở trạng thái này", HttpStatus.FORBIDDEN);
        }
        PageResponse<ProductSummaryResponse> response =
                productService.getAll(status, categoryId, brandId, tagId, keyword, minPrice, maxPrice, rating, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công", response));
    }

}
