package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, length = 150)
    private String publicId; // Cloudinary resource ID

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "file_name", nullable = false, length = 150)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // image/jpeg, video/mp4 etc.

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project; // Optional relationship to map media to specific projects
}
