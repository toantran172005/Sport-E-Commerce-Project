package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.BrandRequest;
import com.sportecommerce.dto.response.BrandResponse;
import com.sportecommerce.entity.Brand;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.BrandRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.service.BrandService;
import com.sportecommerce.util.SlugUtil;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new AppException("Tên thương hiệu đã tồn tại: " + request.getName());
        }

        String uniqueSlug = generateUniqueSlug(SlugUtil.toSlug(request.getName()));

        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(uniqueSlug)
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .isActive(true)
                .build();

        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy brand_id: " + id));

        if (!brand.getName().equals(request.getName())) {
            if (brandRepository.existsByName(request.getName())) {
                throw new AppException("Tên thương hiệu đã tồn tại: " + request.getName());
            }
            brand.setSlug(generateUniqueSlug(SlugUtil.toSlug(request.getName())));
        }

        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setDescription(request.getDescription());

        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy brand_id: " + id));

        if (productRepository.existsByBrand_Id(id)) {
            throw new AppException("Không thể xóa: vẫn còn sản phẩm thuộc thương hiệu này");
        }

        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAll() {
        return brandRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy brand_id: " + id));
        return toResponse(brand);
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private BrandResponse toResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logoUrl(b.getLogoUrl())
                .description(b.getDescription())
                .isActive(b.getIsActive())
                .build();
    }
}
