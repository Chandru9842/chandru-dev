package com.portfolio.cms.service;

import com.portfolio.cms.entity.Skill;
import com.portfolio.cms.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    @Autowired
    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<Skill> getAllSkills() {
        return skillRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findAllByCategoryOrderByDisplayOrderAsc(category);
    }

    @Transactional(readOnly = true)
    public Optional<Skill> getSkillById(Long id) {
        return skillRepository.findById(id);
    }

    @Transactional
    public Skill createSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    @Transactional
    public Skill updateSkill(Long id, Skill input) {
        Skill existing = skillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found with id: " + id));

        existing.setName(input.getName());
        existing.setCategory(input.getCategory());
        existing.setProficiency(input.getProficiency());
        existing.setIconUrl(input.getIconUrl());
        existing.setDisplayOrder(input.getDisplayOrder());

        return skillRepository.save(existing);
    }

    @Transactional
    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new IllegalArgumentException("Skill not found with id: " + id);
        }
        skillRepository.deleteById(id);
    }
}
