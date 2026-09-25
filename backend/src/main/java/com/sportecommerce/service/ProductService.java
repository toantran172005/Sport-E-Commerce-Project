package com.sportecommerce.service;

import com.sportecommerce.dto.request.CreateProductRequest;
import com.sportecommerce.dto.request.UpdateProductRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.ProductResponse;
import com.sportecommerce.dto.response.ProductSummaryResponse;
import com.sportecommerce.enums.ProductStatus;
import org.springframework.data.domain.Pageable;


public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
    ProductResponse updateStatus(Long id, ProductStatus status);
    PageResponse<ProductSummaryResponse> getAll(ProductStatus status, Long categoryId, Long brandId, String keyword, Pageable pageable);
    ProductResponse getById(Long id);
    ProductResponse updateProduct(Long id, CreateProductRequest request);
    void softDelete(Long id);
}
