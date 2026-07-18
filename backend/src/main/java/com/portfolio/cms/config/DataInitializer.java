package com.portfolio.cms.config;

import com.portfolio.cms.entity.Admin;
import com.portfolio.cms.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminRepository adminRepository,
                           PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminRepository.count() == 0) {
            String email = System.getenv("EMAIL");
            if (email == null || email.trim().isEmpty()) {
                email = "admin@example.com";
            }
            String password = System.getenv("APP_PASSWORD");
            if (password == null || password.trim().isEmpty()) {
                password = "admin123";
            }
            String username = "admin";
            if (email.contains("@")) {
                username = email.split("@")[0];
            } else {
                username = email;
            }

            Admin admin = Admin.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .fullName("Default Administrator")
                    .title("Portfolio Administrator")
                    .bio("Default administrator account")
                    .build();

            adminRepository.save(admin);

            System.out.println("Default admin created.");
        }
    }
}