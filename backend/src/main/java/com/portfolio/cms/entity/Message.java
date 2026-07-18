package com.portfolio.cms.entity;

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
}
