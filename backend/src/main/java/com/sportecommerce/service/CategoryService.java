package com.sportecommerce.service;

import com.sportecommerce.dto.request.CategoryRequest;
import com.sportecommerce.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void softDelete(Long id);
    List<CategoryResponse> getAll();
    CategoryResponse getById(Long id);
}
