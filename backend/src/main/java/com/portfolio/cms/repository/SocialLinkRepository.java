package com.portfolio.cms.repository;

import com.portfolio.cms.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findAllByOrderByDisplayOrderAsc();
    List<SocialLink> findAllByIsActiveTrueOrderByDisplayOrderAsc();
    boolean existsByPlatformAndIdNot(String platform, Long id);
    boolean existsByPlatform(String platform);
}
