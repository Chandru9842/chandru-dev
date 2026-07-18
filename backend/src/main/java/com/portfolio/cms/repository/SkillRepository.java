package com.portfolio.cms.repository;

import com.portfolio.cms.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findAllByOrderByDisplayOrderAsc();
    List<Skill> findAllByCategoryOrderByDisplayOrderAsc(String category);
}
