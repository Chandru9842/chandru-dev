export interface CodeFile {
  name: string;
  path: string;
  content: string;
  explanation: string;
}

export interface PackageData {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  files: CodeFile[];
}

export const cleanArchitectureLayers = {
  infrastructure: {
    title: 'Infrastructure Layer',
    description: 'Framework-specific adapters, database drivers, and security configurations. Interacts with external services.',
    packages: ['security', 'config', 'repository']
  },
  interface: {
    title: 'Interface / Presentation Layer',
    description: 'Handles HTTP requests, JSON serialization, and input validation. Exposed to clients.',
    packages: ['controller', 'dto', 'mapper', 'validation', 'exception']
  },
  core: {
    title: 'Core Domain / Application Layer',
    description: 'Contains business logic, domain rules, entities, and use-case services. Framework-independent core.',
    packages: ['entity', 'service']
  }
};

export const packagesList: PackageData[] = [
  {
    name: 'entity',
    status: 'completed',
    description: 'Domain Entities mapping directly to MySQL 3NF database schema using JPA/Hibernate annotations.',
    files: [
      {
        name: 'BaseEntity.java',
        path: 'com/portfolio/cms/entity/BaseEntity.java',
        explanation: 'Auditable base class providing creation and modification timestamps for all persistent records.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}`
      },
      {
        name: 'Admin.java',
        path: 'com/portfolio/cms/entity/Admin.java',
        explanation: 'Admin entity representing the primary portfolio owner, with secure credentials and auditing relationships.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admins", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Builder.Default
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> experiences = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educationList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certificates = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialLink> socialLinks = new ArrayList<>();
}`
      },
      {
        name: 'Project.java',
        path: 'com/portfolio/cms/entity/Project.java',
        explanation: 'Portfolio project entity featuring metadata, technologies used (Skills), media references, and custom layout configuration.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_project_slug", columnList = "slug", unique = true),
    @Index(name = "idx_project_featured", columnList = "is_featured")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 150, unique = true)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_markdown", columnDefinition = "LONGTEXT")
    private String contentMarkdown;

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_skills",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> mediaList = new ArrayList<>();
}`
      },
      {
        name: 'Skill.java',
        path: 'com/portfolio/cms/entity/Skill.java',
        explanation: 'Skill entity representing professional core capabilities, categorized into sections with proficiency level tracking.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skills", indexes = {
    @Index(name = "idx_skill_category", columnList = "category")
})
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
    private String category; // e.g., "Frontend", "Backend", "DevOps", "Database"

    @Column(nullable = false)
    private Integer proficiency; // 1 to 100 percentage

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Builder.Default
    @ManyToMany(mappedBy = "skills", fetch = FetchType.LAZY)
    private Set<Project> projects = new HashSet<>();
}`
      },
      {
        name: 'Certificate.java',
        path: 'com/portfolio/cms/entity/Certificate.java',
        explanation: 'Certificate entity containing credentials, validation URLs, expiration properties, and links back to the portfolio admin.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "issuing_organization", nullable = false, length = 150)
    private String issuingOrganization;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "credential_id", length = 100)
    private String credentialId;

    @Column(name = "credential_url")
    private String credentialUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}`
      },
      {
        name: 'Experience.java',
        path: 'com/portfolio/cms/entity/Experience.java',
        explanation: 'Experience entity capturing professional career milestones, achievements (stored as JSON/serialized structure), and timeline metadata.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "experiences", indexes = {
    @Index(name = "idx_exp_dates", columnList = "start_date, end_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(nullable = false, length = 100)
    private String role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "company_url")
    private String companyUrl;

    @Column(name = "company_logo_url")
    private String companyLogoUrl;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Column(length = 100)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}`
      },
      {
        name: 'Education.java',
        path: 'com/portfolio/cms/entity/Education.java',
        explanation: 'Education entity mapping academic achievements, institutions, majors, and final scores.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "education")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String institution;

    @Column(nullable = false, length = 100)
    private String degree;

    @Column(name = "field_of_study", nullable = false, length = 100)
    private String fieldOfStudy;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Column(length = 50)
    private String grade; // e.g., "GPA: 3.9/4.0", "First Class"

    @Column(columnDefinition = "TEXT")
    private String activities;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}`
      },
      {
        name: 'Message.java',
        path: 'com/portfolio/cms/entity/Message.java',
        explanation: 'Contact Message entity tracking client leads, queries, timestamp data, and status attributes.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_message_status", columnList = "is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;

    @Column(name = "sender_email", nullable = false, length = 100)
    private String senderEmail;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "is_starred", nullable = false)
    private boolean isStarred;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;
}`
      },
      {
        name: 'SocialLink.java',
        path: 'com/portfolio/cms/entity/SocialLink.java',
        explanation: 'Social Link entity defining active networks (GitHub, LinkedIn, Twitter) and custom display rules.',
        content: `package com.portfolio.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLink extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String platform; // e.g., "GitHub", "LinkedIn", "Twitter"

    @Column(nullable = false)
    private String url;

    @Column(name = "icon_name", length = 50)
    private String iconName; // Lucide or custom SVG icon class name

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
}`
      },
      {
        name: 'Settings.java',
        path: 'com/portfolio/cms/entity/Settings.java',
        explanation: 'Global Settings entity storing portfolio styling presets, SEO titles, metadata, and toggles in localized context.',
        content: `package com.portfolio.cms.entity;

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
}`
      },
      {
        name: 'Visitor.java',
        path: 'com/portfolio/cms/entity/Visitor.java',
        explanation: 'Visitor tracking record representing uniquely identified clients using cookies or browser hashes.',
        content: `package com.portfolio.cms.entity;

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
}`
      },
      {
        name: 'Analytics.java',
        path: 'com/portfolio/cms/entity/Analytics.java',
        explanation: 'Analytics metric logger tracking page views, dynamic event triggers, and session timings.',
        content: `package com.portfolio.cms.entity;

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
}`
      },
      {
        name: 'Media.java',
        path: 'com/portfolio/cms/entity/Media.java',
        explanation: 'Media file resource registry managing Cloudinary uploads, file sizes, extensions, and tags.',
        content: `package com.portfolio.cms.entity;

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
}`
      },
      {
        name: 'Resume.java',
        path: 'com/portfolio/cms/entity/Resume.java',
        explanation: 'Resume tracking entity mapping current active uploads, version numbers, and download statistics.',
        content: `package com.portfolio.cms.entity;

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
}`
    }
  ]
},
{
  name: 'repository',
  status: 'completed',
  description: 'Spring Data JPA repositories providing clean database querying, custom specifications, and automated standard CRUD interfaces.',
  files: [
    {
      name: 'AdminRepository.java',
      path: 'com/portfolio/cms/repository/AdminRepository.java',
      explanation: 'Admin querying repository with support for email, username matches, and identity existence checks.',
      content: `package com.portfolio.cms.repository;

import com.portfolio.cms.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);
    Optional<Admin> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}`
    },
    {
      name: 'RefreshTokenRepository.java',
      path: 'com/portfolio/cms/repository/RefreshTokenRepository.java',
      explanation: 'Secure refresh token storage lookup, session querying, and token-rotation validation.',
      content: `package com.portfolio.cms.repository;

import com.portfolio.cms.entity.Admin;
import com.portfolio.cms.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByAdmin(Admin admin);
    
    @Modifying
    int deleteByAdmin(Admin admin);
}`
    }
  ]
},
{
  name: 'security',
  status: 'completed',
  description: 'Spring Security standard filters, JWT validation engines, BCrypt providers, and role restriction configurations.',
  files: [
    {
      name: 'SecurityConfig.java',
      path: 'com/portfolio/cms/security/SecurityConfig.java',
      explanation: 'Main security filter chain securing endpoints, disabling CSRF, setting stateless session rules, and registering JWT authentications.',
      content: `package com.portfolio.cms.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Autowired
    public SecurityConfig(CustomUserDetailsService customUserDetailsService,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          JwtAccessDeniedHandler accessDeniedHandler) {
        this.customUserDetailsService = customUserDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and().csrf().disable()
            .exceptionHandling()
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler)
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/projects/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/skills/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/certificates/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/experiences/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/education/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/social-links/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resumes/active").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/messages").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/analytics/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/resumes/**").hasRole("ADMIN")
                .requestMatchers("/api/media/**").hasRole("ADMIN")
                .anyRequest().authenticated();

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}`
    },
    {
      name: 'JwtTokenProvider.java',
      path: 'com/portfolio/cms/security/JwtTokenProvider.java',
      explanation: 'JWT service generating signed bearer tokens, checking validity, auditing timestamps, and reading claims.',
      content: `package com.portfolio.cms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("\${app.jwt.secret:dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3Ryb25nLWtleS1mb3ItcG9ydGZvbGlvLWNtcw==}")
    private String jwtSecret;

    @Value("\${app.jwt.expiration-in-ms:3600000}")
    private long jwtExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date expiryDate = new Date(new Date().getTime() + jwtExpirationInMs);
        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .claim("username", userPrincipal.getUsername())
                .claim("email", userPrincipal.getEmail())
                .claim("role", "ROLE_ADMIN")
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}`
    }
  ]
},
{
  name: 'dto',
  status: 'completed',
  description: 'Data Transfer Objects cleanly handling payload requests, token responses, and credential packets.',
  files: [
    {
      name: 'LoginRequest.java',
      path: 'com/portfolio/cms/dto/LoginRequest.java',
      explanation: 'Secure authentication request binding username or email, alongside plain-text passwords for BCrypt matches.',
      content: `package com.portfolio.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username or Email is required")
    private String usernameOrEmail;
    @NotBlank(message = "Password is required")
    private String password;
}`
    },
    {
      name: 'TokenResponse.java',
      path: 'com/portfolio/cms/dto/TokenResponse.java',
      explanation: 'Standard bearer payload containing active access token, refresh token rotation value, expiration metrics, and identity roles.',
      content: `package com.portfolio.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private final String tokenType = "Bearer";
    private Long expiresInMs;
    private String username;
    private String role;
}`
    }
  ]
},
{
  name: 'exception',
  status: 'completed',
  description: 'Global Exception handler components parsing bad requests, unauthenticated statuses, and custom client errors.',
  files: [
    {
      name: 'GlobalExceptionHandler.java',
      path: 'com/portfolio/cms/exception/GlobalExceptionHandler.java',
      explanation: 'Spring RestControllerAdvice capturing JWT authentication exception types, formatting unified json responses, and returning standard HTTP headers.',
      content: `package com.portfolio.cms.exception;

import com.portfolio.cms.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, WebRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(ex.getStatus().value())
                .error(ex.getStatus().getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(response, ex.getStatus());
    }
}`
    }
  ]
},
{
  name: 'controller',
  status: 'completed',
  description: 'Main authentication gateway controllers handling user validation, session setup, and logout procedures.',
  files: [
    {
      name: 'AuthController.java',
      path: 'com/portfolio/cms/controller/AuthController.java',
      explanation: 'REST entrypoint providing login credentials validation, dynamic refresh tokens rotation, and security session logouts.',
      content: `package com.portfolio.cms.controller;

import com.portfolio.cms.dto.LoginRequest;
import com.portfolio.cms.dto.RefreshTokenRequest;
import com.portfolio.cms.dto.TokenResponse;
import com.portfolio.cms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        TokenResponse tokenResponse = authService.login(loginRequest);
        return ResponseEntity.ok(tokenResponse);
    }
}`
    }
  ]
}
];
