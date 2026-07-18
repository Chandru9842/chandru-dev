package com.portfolio.cms.service;

import com.portfolio.cms.entity.Resume;
import com.portfolio.cms.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;

    @Autowired
    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @Transactional(readOnly = true)
    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Resume> getActiveResume() {
        return resumeRepository.findByIsActiveTrue();
    }

    @Transactional
    public Resume createResume(Resume resume) {
        if (resume.isActive()) {
            deactivateAllResumes();
        }
        resume.setDownloadCount(0);
        return resumeRepository.save(resume);
    }

    @Transactional
    public Resume activateResume(Long id) {
        Resume target = resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found with id: " + id));
        deactivateAllResumes();
        target.setActive(true);
        return resumeRepository.save(target);
    }

    @Transactional
    public void incrementDownloadCount(Long id) {
        resumeRepository.findById(id).ifPresent(resume -> {
            resume.setDownloadCount(resume.getDownloadCount() + 1);
            resumeRepository.save(resume);
        });
    }

    @Transactional
    public void deleteResume(Long id) {
        if (!resumeRepository.existsById(id)) {
            throw new IllegalArgumentException("Resume not found with id: " + id);
        }
        resumeRepository.deleteById(id);
    }

    private void deactivateAllResumes() {
        List<Resume> all = resumeRepository.findAll();
        for (Resume r : all) {
            if (r.isActive()) {
                r.setActive(false);
                resumeRepository.save(r);
            }
        }
    }
}
