package com.sportecommerce.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Column(name = "slug", length = 120 , nullable = false, unique = true)
    private String slug;

    @OneToMany(mappedBy = "tag")
    @Builder.Default
    private List<ProductTag> productTags = new ArrayList<>();
}
