package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.TagRequest;
import com.sportecommerce.dto.response.TagResponse;
import com.sportecommerce.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;

    @PostMapping
    public ResponseEntity<ApiResponse<TagResponse>> create(@Valid @RequestBody TagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tag thành công", tagService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> update(
            @PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tag thành công", tagService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tag thành công", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tag thành công", tagService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết tag thành công", tagService.getById(id)));
    }
}
