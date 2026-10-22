package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.TagRequest;
import com.sportecommerce.dto.response.TagResponse;
import com.sportecommerce.entity.Tag;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.ProductTagRepository;
import com.sportecommerce.repository.TagRepository;
import com.sportecommerce.service.TagService;
import com.sportecommerce.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;
    private final ProductTagRepository productTagRepository;

    @Override
    @Transactional
    public TagResponse create(TagRequest request) {
        String name = request.getName().trim();
        if (tagRepository.existsByName(name)) {
            throw new AppException("Tag đã tồn tại: " + name);
        }

        Tag tag = Tag.builder()
                .name(name)
                .slug(generateUniqueSlug(SlugUtil.toSlug(name)))
                .build();

        return toResponse(tagRepository.save(tag));
    }

    @Override
    @Transactional
    public TagResponse update(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tag_id: " + id));

        String newName = request.getName().trim();
        if (!tag.getName().equals(newName)) {
            if (tagRepository.existsByName(newName)) {
                throw new AppException("Tag đã tồn tại: " + newName);
            }
            tag.setName(newName);
            tag.setSlug(generateUniqueSlug(SlugUtil.toSlug(newName)));
        }

        return toResponse(tagRepository.save(tag));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tag_id: " + id));

        if (productTagRepository.existsByTag_Id(id)) {
            throw new AppException("Không thể xóa: tag đang được gắn vào sản phẩm");
        }

        tagRepository.delete(tag);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagResponse> getAll() {
        return tagRepository.findAll(Sort.by("name").ascending()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TagResponse getById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tag_id: " + id));
        return toResponse(tag);
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (tagRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private TagResponse toResponse(Tag t) {
        return TagResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .build();
    }
}
