package com.portfolio.cms.service;

import com.portfolio.cms.entity.Project;
import com.portfolio.cms.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Project> getFeaturedProjects() {
        return projectRepository.findAllByIsFeaturedTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Transactional
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, Project input) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        existing.setTitle(input.getTitle());
        existing.setSlug(input.getSlug());
        existing.setDescription(input.getDescription());
        existing.setContentMarkdown(input.getContentMarkdown());
        existing.setLiveUrl(input.getLiveUrl());
        existing.setGithubUrl(input.getGithubUrl());
        existing.setStartDate(input.getStartDate());
        existing.setEndDate(input.getEndDate());
        existing.setFeatured(input.isFeatured());
        existing.setDisplayOrder(input.getDisplayOrder());

        return projectRepository.save(existing);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }
}
