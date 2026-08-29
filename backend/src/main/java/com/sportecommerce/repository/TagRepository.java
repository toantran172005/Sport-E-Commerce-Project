package com.sportecommerce.repository;

import com.sportecommerce.entity.TagRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepositoryRepository extends JpaRepository<TagRepository, Long> {
}
