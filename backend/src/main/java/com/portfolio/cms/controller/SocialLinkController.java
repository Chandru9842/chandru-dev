package com.portfolio.cms.controller;

import com.portfolio.cms.entity.SocialLink;
import com.portfolio.cms.service.SocialLinkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social-links")
public class SocialLinkController {

    private final SocialLinkService socialLinkService;

    @Autowired
    public SocialLinkController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<SocialLink>> getAllSocialLinks() {
        List<SocialLink> list = socialLinkService.getAllSocialLinks();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/active")
    public ResponseEntity<List<SocialLink>> getActiveSocialLinks() {
        List<SocialLink> list = socialLinkService.getActiveSocialLinks();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SocialLink> createSocialLink(@Valid @RequestBody SocialLink socialLink) {
        try {
            SocialLink created = socialLinkService.createSocialLink(socialLink);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SocialLink> updateSocialLink(@PathVariable Long id, @Valid @RequestBody SocialLink socialLink) {
        try {
            SocialLink updated = socialLinkService.updateSocialLink(id, socialLink);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSocialLink(@PathVariable Long id) {
        try {
            socialLinkService.deleteSocialLink(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderSocialLinks(@RequestBody List<Long> orderedIds) {
        socialLinkService.updateOrders(orderedIds);
        return ResponseEntity.ok().build();
    }
}
