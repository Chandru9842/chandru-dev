package com.portfolio.cms.service;

import com.portfolio.cms.entity.Analytics;
import com.portfolio.cms.entity.Visitor;
import com.portfolio.cms.repository.AnalyticsRepository;
import com.portfolio.cms.repository.VisitorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final VisitorRepository visitorRepository;

    @Autowired
    public AnalyticsService(AnalyticsRepository analyticsRepository, VisitorRepository visitorRepository) {
        this.analyticsRepository = analyticsRepository;
        this.visitorRepository = visitorRepository;
    }

    @Transactional(readOnly = true)
    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public long getUniqueVisitorCount() {
        return visitorRepository.count();
    }

    @Transactional(readOnly = true)
    public long getTotalPageViews() {
        return analyticsRepository.count();
    }

    @Transactional
    public Analytics recordPageView(String visitorHash, String ip, String userAgent, String path, String referrer) {
        Visitor visitor = visitorRepository.findByVisitorHash(visitorHash)
                .orElseGet(() -> {
                    Visitor v = Visitor.builder()
                            .visitorHash(visitorHash)
                            .ipAddress(ip)
                            .userAgent(userAgent)
                            .build();
                    return visitorRepository.save(v);
                });

        Analytics record = Analytics.builder()
                .pathAccessed(path)
                .referrer(referrer)
                .visitor(visitor)
                .build();

        return analyticsRepository.save(record);
    }
}
