package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String version; // e.g. "v1.4", "2026-July-Update"

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "download_count", nullable = false)
    private Integer downloadCount;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}
