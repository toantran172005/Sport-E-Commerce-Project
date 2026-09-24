package com.sportecommerce.repository;

import com.sportecommerce.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByName(String name);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
