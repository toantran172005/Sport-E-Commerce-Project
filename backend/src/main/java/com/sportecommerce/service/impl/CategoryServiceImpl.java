package com.sportecommerce.service.impl;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.sportecommerce.dto.request.CategoryRequest;
import com.sportecommerce.dto.response.CategoryResponse;
import com.sportecommerce.entity.Category;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.CategoryRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.service.CategoryService;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.SlugUtil;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final MapperUtil mapperUtil;

    @Override
    @Transactional
    @CacheEvict(cacheNames = "categories", allEntries = true)
    public CategoryResponse create(CategoryRequest request) {
        Category parent = resolveParent(request.getParentId(), null);

        String uniqueSlug = generateUniqueSlug(SlugUtil.toSlug(request.getName()));

        Category category = Category.builder()
                .parent(parent)
                .name(request.getName())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();

        return mapperUtil.mapToCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "categories", allEntries = true)
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + id));

        if (request.getParentId() != null && request.getParentId().equals(id)) {
            throw new AppException("Category không thể là parent của chính nó");
        }
        Category parent = resolveParent(request.getParentId(), id);

        if (!category.getName().equals(request.getName())) {
            category.setSlug(generateUniqueSlug(SlugUtil.toSlug(request.getName())));
        }

        category.setParent(parent);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        return mapperUtil.mapToCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "categories", allEntries = true)
    public void softDelete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + id));

        if (productRepository.existsByCategory_IdAndDeletedAtIsNull(id)) {
            throw new AppException(
                    "Không thể xóa: vẫn còn sản phẩm thuộc category này");
        }

        if (categoryRepository.existsByParent_Id(id)) {
            throw new AppException("Không thể xóa: category này vẫn còn category con");
        }

        category.setIsActive(false);
        categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("categories")
    public List<CategoryResponse> getAll() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(mapperUtil::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "categories", key = "#p0")
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + id));
        return mapperUtil.mapToCategoryResponse(category);
    }

    private Category resolveParent(Long parentId, Long currentId) {
        if (parentId == null) {
            return null;
        }
        if (parentId.equals(currentId)) {
            throw new AppException("Category không thể là parent của chính nó");
        }
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy parent_id: " + parentId));
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

}
