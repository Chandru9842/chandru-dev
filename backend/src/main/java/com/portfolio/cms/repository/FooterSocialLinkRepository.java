package com.portfolio.cms.repository;

import com.portfolio.cms.entity.FooterSocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FooterSocialLinkRepository extends JpaRepository<FooterSocialLink, Long> {
    List<FooterSocialLink> findAllByOrderByDisplayOrderAsc();
    List<FooterSocialLink> findAllByIsVisibleTrueOrderByDisplayOrderAsc();
    boolean existsByPlatformAndIdNot(String platform, Long id);
    boolean existsByPlatform(String platform);
}
