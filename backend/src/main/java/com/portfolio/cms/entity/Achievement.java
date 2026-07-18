package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "achievements", indexes = {
    @Index(name = "idx_achievement_featured", columnList = "is_featured"),
    @Index(name = "idx_achievement_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 150)
    private String subtitle;

    @Column(name = "short_description", length = 255)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category; // e.g., "Hackathon", "Award", "Coding", "Certification"

    @Column(nullable = false, length = 150)
    private String organization;

    @Column(name = "achievement_date")
    private LocalDate achievementDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(name = "credential_url")
    private String credentialUrl;

    @Column(name = "project_url")
    private String projectUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "demo_url")
    private String demoUrl;

    @Column(length = 100)
    private String position;

    @Column(name = "award_type", length = 100)
    private String awardType;

    @Column(length = 50)
    private String badge;

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured;

    @Column(name = "is_visible", nullable = false)
    private boolean isVisible;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}
