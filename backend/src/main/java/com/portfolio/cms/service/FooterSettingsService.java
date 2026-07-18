package com.portfolio.cms.service;

import com.portfolio.cms.entity.FooterSettings;
import com.portfolio.cms.repository.FooterSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FooterSettingsService {

    private final FooterSettingsRepository footerSettingsRepository;

    @Autowired
    public FooterSettingsService(FooterSettingsRepository footerSettingsRepository) {
        this.footerSettingsRepository = footerSettingsRepository;
    }

    @Transactional(readOnly = true)
    public FooterSettings getFooterSettings() {
        return footerSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> createDefaultFooterSettings());
    }

    @Transactional
    public FooterSettings saveFooterSettings(FooterSettings input) {
        FooterSettings existing = footerSettingsRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        if (existing == null) {
            return footerSettingsRepository.save(input);
        }

        existing.setTitle(input.getTitle());
        existing.setDescription(input.getDescription());
        existing.setCopyrightText(input.getCopyrightText());
        existing.setBuiltWithText(input.getBuiltWithText());
        existing.setContactInfo(input.getContactInfo());
        existing.setShowResume(input.isShowResume());
        existing.setResumeText(input.getResumeText());
        existing.setLogoText(input.getLogoText());
        existing.setLogoUrl(input.getLogoUrl());
        existing.setBackgroundType(input.getBackgroundType());
        existing.setCustomBackgroundUrl(input.getCustomBackgroundUrl());
        existing.setTheme(input.getTheme());
        existing.setVisible(input.isVisible());

        return footerSettingsRepository.save(existing);
    }

    @Transactional
    public FooterSettings createDefaultFooterSettings() {
        FooterSettings defaultFooter = FooterSettings.builder()
                .title("Alex Dev")
                .description("Designing high-throughput distributed architectures & interactive visual frameworks.")
                .copyrightText("© 2026 Chandru Mohan Portfolio. All database relations mapped to 3NF standards.")
                .builtWithText("Securely served from local sandbox cache. Admin actions synchronized with Express backend.")
                .contactInfo("chandrumohan550@gmail.com | San Francisco, California")
                .showResume(true)
                .resumeText("View Resume")
                .logoText("Alex Rivera")
                .logoUrl("")
                .backgroundType("glass")
                .customBackgroundUrl("")
                .theme("glass")
                .isVisible(true)
                .build();
        return footerSettingsRepository.save(defaultFooter);
    }
}
