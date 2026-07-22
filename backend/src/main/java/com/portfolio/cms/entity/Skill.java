package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "skills",
    indexes = {
        @Index(name = "idx_skill_category", columnList = "category")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Builder.Default
    @Column(nullable = false)
    private Integer proficiency = 80;

    @Column(name = "icon_url")
    private String iconUrl;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Builder.Default
    @ManyToMany(mappedBy = "skills", fetch = FetchType.LAZY)
    private Set<Project> projects = new HashSet<>();
}
