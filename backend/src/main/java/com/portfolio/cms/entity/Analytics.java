package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "analytics", indexes = {
    @Index(name = "idx_analytics_path", columnList = "path_accessed"),
    @Index(name = "idx_analytics_time", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analytics extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "path_accessed", nullable = false)
    private String pathAccessed;

    @Column(name = "referrer")
    private String referrer;

    @Column(name = "duration_ms")
    private Long durationMs; // Time spent on page (if logged on exit)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id", nullable = false)
    private Visitor visitor;
}
