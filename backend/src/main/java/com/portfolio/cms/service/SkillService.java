package com.portfolio.cms.service;

import com.portfolio.cms.dto.SkillOrderRequest;
import com.portfolio.cms.entity.Admin;
import com.portfolio.cms.entity.Skill;
import com.portfolio.cms.repository.AdminRepository;
import com.portfolio.cms.repository.SkillRepository;
import com.portfolio.cms.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public SkillService(
            SkillRepository skillRepository,
            AdminRepository adminRepository) {

        this.skillRepository = skillRepository;
        this.adminRepository = adminRepository;
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

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        Admin admin = adminRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        skill.setAdmin(admin);

        if (skill.getProficiency() == null) {
            skill.setProficiency(80);
        }

        if (skill.getDisplayOrder() == null) {
            skill.setDisplayOrder(skillRepository.findAll().size() + 1);
        }

        return skillRepository.save(skill);
    }

    @Transactional
    public Skill updateSkill(Long id, Skill input) {

        Skill existing = skillRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Skill not found with id: " + id));

        existing.setName(input.getName());
        existing.setCategory(input.getCategory());

        if (input.getProficiency() != null) {
            existing.setProficiency(input.getProficiency());
        }

        existing.setIconUrl(input.getIconUrl());

        if (input.getDisplayOrder() != null) {
            existing.setDisplayOrder(input.getDisplayOrder());
        }

        return skillRepository.save(existing);
    }

    @Transactional
    public void deleteSkill(Long id) {

        if (!skillRepository.existsById(id)) {
            throw new IllegalArgumentException("Skill not found with id: " + id);
        }

        skillRepository.deleteById(id);
    }

    @Transactional
    public void reorderSkills(List<SkillOrderRequest> orderList) {

        for (SkillOrderRequest item : orderList) {

            Skill skill = skillRepository.findById(item.getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Skill not found with id: " + item.getId()));

            skill.setDisplayOrder(item.getDisplayOrder());

            skillRepository.save(skill);
        }
    }
}
