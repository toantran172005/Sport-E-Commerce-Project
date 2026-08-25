package com.sportecommerce.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "review_replies")
public class ReviewReply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "review_id", nullable = false, unique = true)
    private Long reviewId;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "reply_text", nullable = false, columnDefinition = "TEXT")
    private String replyText;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;
}