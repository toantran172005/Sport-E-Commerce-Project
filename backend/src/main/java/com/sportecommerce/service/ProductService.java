package com.sportecommerce.service;

import com.sportecommerce.dto.request.CreateProductRequest;
import com.sportecommerce.dto.response.ProductResponse;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
}
