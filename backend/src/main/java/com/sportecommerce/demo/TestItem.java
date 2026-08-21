package com.sportecommerce.demo;

import jakarta.persistence.*;
import lombok.Setter;

@Entity
@Table(name = "test_items")
public class TestItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String name;

    public TestItem() {
    }

    public TestItem(String name) {
        this.name = name;
    }

    // Getters và Setters...
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
