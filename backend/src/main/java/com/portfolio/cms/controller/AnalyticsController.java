package com.portfolio.cms.controller;

import com.portfolio.cms.entity.Analytics;
import com.portfolio.cms.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Analytics>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllAnalytics());
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPageViews", analyticsService.getTotalPageViews());
        summary.put("uniqueVisitors", analyticsService.getUniqueVisitorCount());
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/track")
    public ResponseEntity<Map<String, Object>> trackPageView(
            @RequestParam(required = false, defaultValue = "guest_hash") String visitorHash,
            @RequestParam String path,
            @RequestParam(required = false) String referrer,
            HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        Analytics record = analyticsService.recordPageView(visitorHash, ip, userAgent, path, referrer);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("recordId", record.getId());
        return ResponseEntity.ok(response);
    }
}
