package com.portfolio.cms.repository;

import com.portfolio.cms.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByOrderByCreatedAtDesc();
    List<Message> findAllByIsReadFalseOrderByCreatedAtDesc();
}
