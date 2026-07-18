package com.portfolio.cms.service;

import com.portfolio.cms.entity.Certificate;
import com.portfolio.cms.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;

    @Autowired
    public CertificateService(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    @Transactional(readOnly = true)
    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAllByOrderByIssueDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Certificate> getCertificateById(Long id) {
        return certificateRepository.findById(id);
    }

    @Transactional
    public Certificate createCertificate(Certificate certificate) {
        return certificateRepository.save(certificate);
    }

    @Transactional
    public Certificate updateCertificate(Long id, Certificate input) {
        Certificate existing = certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found with id: " + id));

        existing.setName(input.getName());
        existing.setIssuingOrganization(input.getIssuingOrganization());
        existing.setIssueDate(input.getIssueDate());
        existing.setExpirationDate(input.getExpirationDate());
        existing.setCredentialId(input.getCredentialId());
        existing.setCredentialUrl(input.getCredentialUrl());

        return certificateRepository.save(existing);
    }

    @Transactional
    public void deleteCertificate(Long id) {
        if (!certificateRepository.existsById(id)) {
            throw new IllegalArgumentException("Certificate not found with id: " + id);
        }
        certificateRepository.deleteById(id);
    }
}
