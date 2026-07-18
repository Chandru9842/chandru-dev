package com.portfolio.cms.service;

import com.portfolio.cms.entity.Experience;
import com.portfolio.cms.repository.ExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    @Autowired
    public ExperienceService(ExperienceRepository experienceRepository) {
        this.experienceRepository = experienceRepository;
    }

    @Transactional(readOnly = true)
    public List<Experience> getAllExperiences() {
        return experienceRepository.findAllByOrderByStartDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Experience> getExperienceById(Long id) {
        return experienceRepository.findById(id);
    }

    @Transactional
    public Experience createExperience(Experience experience) {
        return experienceRepository.save(experience);
    }

    @Transactional
    public Experience updateExperience(Long id, Experience input) {
        Experience existing = experienceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + id));

        existing.setCompany(input.getCompany());
        existing.setRole(input.getRole());
        existing.setDescription(input.getDescription());
        existing.setCompanyUrl(input.getCompanyUrl());
        existing.setCompanyLogoUrl(input.getCompanyLogoUrl());
        existing.setStartDate(input.getStartDate());
        existing.setEndDate(input.getEndDate());
        existing.setCurrent(input.isCurrent());
        existing.setLocation(input.getLocation());

        return experienceRepository.save(existing);
    }

    @Transactional
    public void deleteExperience(Long id) {
        if (!experienceRepository.existsById(id)) {
            throw new IllegalArgumentException("Experience not found with id: " + id);
        }
        experienceRepository.deleteById(id);
    }
}
