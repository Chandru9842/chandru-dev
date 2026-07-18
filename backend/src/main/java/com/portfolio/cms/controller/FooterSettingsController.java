package com.portfolio.cms.controller;

import com.portfolio.cms.entity.FooterSettings;
import com.portfolio.cms.service.FooterSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/footer")
public class FooterSettingsController {

    private final FooterSettingsService footerSettingsService;

    @Autowired
    public FooterSettingsController(FooterSettingsService footerSettingsService) {
        this.footerSettingsService = footerSettingsService;
    }

    @GetMapping
    public ResponseEntity<FooterSettings> getFooterSettings() {
        FooterSettings settings = footerSettingsService.getFooterSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FooterSettings> updateFooterSettings(@Valid @RequestBody FooterSettings settings) {
        FooterSettings updated = footerSettingsService.saveFooterSettings(settings);
        return ResponseEntity.ok(updated);
    }
}
