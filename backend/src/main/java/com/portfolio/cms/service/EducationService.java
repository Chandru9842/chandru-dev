package com.portfolio.cms.service;

import com.portfolio.cms.entity.Education;
import com.portfolio.cms.repository.EducationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    @Autowired
    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    @Transactional(readOnly = true)
    public List<Education> getAllEducation() {
        return educationRepository.findAllByOrderByStartDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Education> getEducationById(Long id) {
        return educationRepository.findById(id);
    }

    @Transactional
    public Education createEducation(Education education) {
        return educationRepository.save(education);
    }

    @Transactional
    public Education updateEducation(Long id, Education input) {
        Education existing = educationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found with id: " + id));

        existing.setInstitution(input.getInstitution());
        existing.setDegree(input.getDegree());
        existing.setFieldOfStudy(input.getFieldOfStudy());
        existing.setStartDate(input.getStartDate());
        existing.setEndDate(input.getEndDate());
        existing.setCurrent(input.isCurrent());
        existing.setGrade(input.getGrade());
        existing.setActivities(input.getActivities());

        return educationRepository.save(existing);
    }

    @Transactional
    public void deleteEducation(Long id) {
        if (!educationRepository.existsById(id)) {
            throw new IllegalArgumentException("Education not found with id: " + id);
        }
        educationRepository.deleteById(id);
    }
}
