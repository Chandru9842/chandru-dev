package com.portfolio.cms.service;

import com.portfolio.cms.entity.Settings;
import com.portfolio.cms.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class SettingsService {

    private final SettingsRepository settingsRepository;

    @Autowired
    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @Transactional(readOnly = true)
    public Settings getSettings() {
        return settingsRepository.findAll().stream().findFirst().orElseGet(() -> {
            Settings defaults = Settings.builder()
                    .siteName("Alex Dev CMS")
                    .siteDescription("Professional Full Stack Developer Portfolio")
                    .metaKeywords("java, spring boot, react, cloud, mysql, docker")
                    .themeColor("#10b981")
                    .analyticsId("G-XXXX")
                    .isMaintenanceMode(false)
                    .allowContact(true)
                    .build();
            return settingsRepository.save(defaults);
        });
    }

    @Transactional
    public Settings updateSettings(Settings input) {
        Settings existing = getSettings();
        existing.setSiteName(input.getSiteName());
        existing.setSiteDescription(input.getSiteDescription());
        existing.setMetaKeywords(input.getMetaKeywords());
        existing.setThemeColor(input.getThemeColor());
        existing.setAnalyticsId(input.getAnalyticsId());
        existing.setMaintenanceMode(input.isMaintenanceMode());
        existing.setAllowContact(input.isAllowContact());
        return settingsRepository.save(existing);
    }
}
