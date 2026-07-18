package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visitors", uniqueConstraints = {
    @UniqueConstraint(columnNames = "visitor_hash")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_hash", nullable = false, length = 64)
    private String visitorHash; // SHA-256 footprint of browser/IP

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Builder.Default
    @OneToMany(mappedBy = "visitor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analytics> analyticsRecords = new ArrayList<>();
}
