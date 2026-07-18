package com.portfolio.cms.service;

import com.portfolio.cms.entity.Message;
import com.portfolio.cms.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional(readOnly = true)
    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Message> getUnreadMessages() {
        return messageRepository.findAllByIsReadFalseOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    @Transactional
    public Message createMessage(Message message) {
        message.setRead(false);
        message.setStarred(false);
        return messageRepository.save(message);
    }

    @Transactional
    public Message markAsRead(Long id, boolean isRead) {
        Message existing = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with id: " + id));
        existing.setRead(isRead);
        return messageRepository.save(existing);
    }

    @Transactional
    public Message toggleStarred(Long id) {
        Message existing = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with id: " + id));
        existing.setStarred(!existing.isStarred());
        return messageRepository.save(existing);
    }

    @Transactional
    public void deleteMessage(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new IllegalArgumentException("Message not found with id: " + id);
        }
        messageRepository.deleteById(id);
    }
}
