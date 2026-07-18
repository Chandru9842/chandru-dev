package com.portfolio.cms.service;

import com.portfolio.cms.entity.SocialLink;
import com.portfolio.cms.repository.SocialLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class SocialLinkService {

    private final SocialLinkRepository socialLinkRepository;

    @Autowired
    public SocialLinkService(SocialLinkRepository socialLinkRepository) {
        this.socialLinkRepository = socialLinkRepository;
    }

    @Transactional(readOnly = true)
    public List<SocialLink> getAllSocialLinks() {
        return socialLinkRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<SocialLink> getActiveSocialLinks() {
        return socialLinkRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public Optional<SocialLink> getSocialLinkById(Long id) {
        return socialLinkRepository.findById(id);
    }

    @Transactional
    public SocialLink createSocialLink(SocialLink socialLink) {
        if (!"Custom Platform".equalsIgnoreCase(socialLink.getPlatform())) {
            if (socialLinkRepository.existsByPlatform(socialLink.getPlatform())) {
                throw new IllegalArgumentException("A social link for " + socialLink.getPlatform() + " already exists.");
            }
        }
        return socialLinkRepository.save(socialLink);
    }

    @Transactional
    public SocialLink updateSocialLink(Long id, SocialLink input) {
        SocialLink existing = socialLinkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Social link not found with id: " + id));

        if (!"Custom Platform".equalsIgnoreCase(input.getPlatform())) {
            if (socialLinkRepository.existsByPlatformAndIdNot(input.getPlatform(), id)) {
                throw new IllegalArgumentException("A social link for " + input.getPlatform() + " already exists.");
            }
        }

        existing.setPlatform(input.getPlatform());
        existing.setUrl(input.getUrl());
        existing.setIconName(input.getIconName());
        existing.setDisplayOrder(input.getDisplayOrder());
        existing.setActive(input.isActive());

        return socialLinkRepository.save(existing);
    }

    @Transactional
    public void deleteSocialLink(Long id) {
        if (!socialLinkRepository.existsById(id)) {
            throw new IllegalArgumentException("Social link not found with id: " + id);
        }
        socialLinkRepository.deleteById(id);
    }

    @Transactional
    public void updateOrders(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            int order = i + 1;
            socialLinkRepository.findById(id).ifPresent(link -> {
                link.setDisplayOrder(order);
                socialLinkRepository.save(link);
            });
        }
    }
}
