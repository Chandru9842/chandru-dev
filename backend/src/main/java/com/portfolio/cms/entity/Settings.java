package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "site_name", nullable = false, length = 100)
    private String siteName;

    @Column(name = "site_description", length = 255)
    private String siteDescription;

    @Column(name = "meta_keywords", length = 255)
    private String metaKeywords;

    @Column(name = "theme_color", length = 30)
    private String themeColor;

    @Column(name = "analytics_id", length = 50)
    private String analyticsId;

    @Column(name = "is_maintenance_mode", nullable = false)
    private boolean isMaintenanceMode;

    @Column(name = "allow_contact", nullable = false)
    private boolean allowContact;
}
