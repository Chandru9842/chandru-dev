package com.portfolio.cms.repository;

import com.portfolio.cms.entity.FooterSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FooterSettingsRepository extends JpaRepository<FooterSettings, Long> {
}
