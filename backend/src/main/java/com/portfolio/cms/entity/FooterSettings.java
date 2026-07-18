package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "footer_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FooterSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(name = "copyright_text", length = 255)
    private String copyrightText;

    @Column(name = "built_with_text", length = 255)
    private String builtWithText;

    @Column(name = "contact_info", length = 255)
    private String contactInfo;

    @Column(name = "show_resume", nullable = false)
    private boolean showResume;

    @Column(name = "resume_text", length = 50)
    private String resumeText;

    @Column(name = "logo_text", length = 100)
    private String logoText;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(name = "background_type", length = 50)
    private String backgroundType;

    @Column(name = "custom_background_url", length = 255)
    private String customBackgroundUrl;

    @Column(name = "theme", length = 50)
    private String theme;

    @Column(name = "is_visible", nullable = false)
    private boolean isVisible;
}
