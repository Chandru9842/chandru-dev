package com.portfolio.cms.service;

import com.portfolio.cms.entity.Achievement;
import com.portfolio.cms.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    @Transactional(readOnly = true)
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Achievement> getVisibleAchievements() {
        return achievementRepository.findAllByIsVisibleTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Achievement> getAchievementById(Long id) {
        return achievementRepository.findById(id);
    }

    @Transactional
    public Achievement createAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    @Transactional
    public Achievement updateAchievement(Long id, Achievement input) {
        Achievement existing = achievementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Achievement not found with id: " + id));

        existing.setTitle(input.getTitle());
        existing.setSubtitle(input.getSubtitle());
        existing.setShortDescription(input.getShortDescription());
        existing.setDescription(input.getDescription());
        existing.setCategory(input.getCategory());
        existing.setOrganization(input.getOrganization());
        existing.setAchievementDate(input.getAchievementDate());
        existing.setImageUrl(input.getImageUrl());
        existing.setLogoUrl(input.getLogoUrl());
        existing.setCertificateUrl(input.getCertificateUrl());
        existing.setCredentialUrl(input.getCredentialUrl());
        existing.setProjectUrl(input.getProjectUrl());
        existing.setGithubUrl(input.getGithubUrl());
        existing.setDemoUrl(input.getDemoUrl());
        existing.setPosition(input.getPosition());
        existing.setAwardType(input.getAwardType());
        existing.setBadge(input.getBadge());
        existing.setFeatured(input.isFeatured());
        existing.setVisible(input.isVisible());
        existing.setDisplayOrder(input.getDisplayOrder());

        return achievementRepository.save(existing);
    }

    @Transactional
    public void deleteAchievement(Long id) {
        if (!achievementRepository.existsById(id)) {
            throw new IllegalArgumentException("Achievement not found with id: " + id);
        }
        achievementRepository.deleteById(id);
    }
}
