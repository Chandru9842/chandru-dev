package com.portfolio.cms.service;

import com.portfolio.cms.entity.FooterSocialLink;
import com.portfolio.cms.repository.FooterSocialLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class FooterSocialLinkService {

    private final FooterSocialLinkRepository footerSocialLinkRepository;

    @Autowired
    public FooterSocialLinkService(FooterSocialLinkRepository footerSocialLinkRepository) {
        this.footerSocialLinkRepository = footerSocialLinkRepository;
    }

    @Transactional(readOnly = true)
    public List<FooterSocialLink> getAllSocialLinks() {
        return footerSocialLinkRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<FooterSocialLink> getVisibleSocialLinks() {
        return footerSocialLinkRepository.findAllByIsVisibleTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public Optional<FooterSocialLink> getSocialLinkById(Long id) {
        return footerSocialLinkRepository.findById(id);
    }

    @Transactional
    public FooterSocialLink createSocialLink(FooterSocialLink socialLink) {
        if (!"Custom Platform".equalsIgnoreCase(socialLink.getPlatform())) {
            if (footerSocialLinkRepository.existsByPlatform(socialLink.getPlatform())) {
                throw new IllegalArgumentException("A footer social link for " + socialLink.getPlatform() + " already exists.");
            }
        }
        return footerSocialLinkRepository.save(socialLink);
    }

    @Transactional
    public FooterSocialLink updateSocialLink(Long id, FooterSocialLink input) {
        FooterSocialLink existing = footerSocialLinkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Footer social link not found with id: " + id));

        if (!"Custom Platform".equalsIgnoreCase(input.getPlatform())) {
            if (footerSocialLinkRepository.existsByPlatformAndIdNot(input.getPlatform(), id)) {
                throw new IllegalArgumentException("A footer social link for " + input.getPlatform() + " already exists.");
            }
        }

        existing.setPlatform(input.getPlatform());
        existing.setUrl(input.getUrl());
        existing.setIconName(input.getIconName());
        existing.setDisplayOrder(input.getDisplayOrder());
        existing.setVisible(input.isVisible());

        return footerSocialLinkRepository.save(existing);
    }

    @Transactional
    public void deleteSocialLink(Long id) {
        if (!footerSocialLinkRepository.existsById(id)) {
            throw new IllegalArgumentException("Footer social link not found with id: " + id);
        }
        footerSocialLinkRepository.deleteById(id);
    }

    @Transactional
    public void updateOrders(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            int order = i + 1;
            footerSocialLinkRepository.findById(id).ifPresent(link -> {
                link.setDisplayOrder(order);
                footerSocialLinkRepository.save(link);
            });
        }
    }
}
