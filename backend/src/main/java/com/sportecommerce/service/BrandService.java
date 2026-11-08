package com.sportecommerce.service;

import com.sportecommerce.dto.request.BrandRequest;
import com.sportecommerce.dto.response.BrandResponse;

import java.util.List;

public interface BrandService {
    BrandResponse create(BrandRequest request);
    BrandResponse update(Long id, BrandRequest request);
    void softDelete(Long id);
    List<BrandResponse> getAll();
    BrandResponse getById(Long id);
}
