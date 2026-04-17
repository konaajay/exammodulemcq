package com.lms.www.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.lms.www.management.model.Admin;
import com.lms.www.management.repository.AdminRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        adminRepository.findByEmail(adminEmail).ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                adminRepository.save(admin);
                log.info(">>>> ADMIN PASSWORD UPDATED/SYNCED: {}", adminEmail);
            },
            () -> {
                Admin admin = Admin.builder()
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role("ADMIN")
                        .build();
                adminRepository.save(admin);
                log.info(">>>> DEFAULT ADMIN CREATED: {} / {}", adminEmail, adminPassword);
            }
        );
    }
}
