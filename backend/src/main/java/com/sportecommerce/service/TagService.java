package com.sportecommerce.service;

import com.sportecommerce.dto.request.TagRequest;
import com.sportecommerce.dto.response.TagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

public interface TagService {
    TagResponse create(TagRequest request);
    TagResponse update(Long id, TagRequest request);
    void delete(Long id);
    List<TagResponse> getAll();
    TagResponse getById(Long id);
}
