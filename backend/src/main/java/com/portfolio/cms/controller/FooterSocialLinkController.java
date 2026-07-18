package com.portfolio.cms.controller;

import com.portfolio.cms.entity.FooterSocialLink;
import com.portfolio.cms.service.FooterSocialLinkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/footer/social-links")
public class FooterSocialLinkController {

    private final FooterSocialLinkService footerSocialLinkService;

    @Autowired
    public FooterSocialLinkController(FooterSocialLinkService footerSocialLinkService) {
        this.footerSocialLinkService = footerSocialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<FooterSocialLink>> getAllSocialLinks() {
        List<FooterSocialLink> list = footerSocialLinkService.getAllSocialLinks();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<FooterSocialLink>> getVisibleSocialLinks() {
        List<FooterSocialLink> list = footerSocialLinkService.getVisibleSocialLinks();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FooterSocialLink> createSocialLink(@Valid @RequestBody FooterSocialLink socialLink) {
        try {
            FooterSocialLink created = footerSocialLinkService.createSocialLink(socialLink);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FooterSocialLink> updateSocialLink(@PathVariable Long id, @Valid @RequestBody FooterSocialLink socialLink) {
        try {
            FooterSocialLink updated = footerSocialLinkService.updateSocialLink(id, socialLink);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSocialLink(@PathVariable Long id) {
        try {
            footerSocialLinkService.deleteSocialLink(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderSocialLinks(@RequestBody List<Long> orderedIds) {
        footerSocialLinkService.updateOrders(orderedIds);
        return ResponseEntity.ok().build();
    }
}
