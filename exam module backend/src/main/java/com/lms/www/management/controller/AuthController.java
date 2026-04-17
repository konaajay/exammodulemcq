package com.lms.www.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.lms.www.management.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private final AdminRepository adminRepository;
    private final com.lms.www.management.repository.StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        System.out.println("Login attempt for: " + email);

        // 1. Check Admin Table
        var adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            var admin = adminOpt.get();
            if (passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                System.out.println("Admin found and authenticated.");
                return ResponseEntity.ok(Map.of(
                        "email", admin.getEmail(),
                        "role", "ADMIN",
                        "success", true));
            } else {
                System.out.println("Admin found but password mismatch for: " + email);
            }
        }

        // 2. Check Student Table (Fallback)
        var studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            var student = studentOpt.get();
            if (passwordEncoder.matches(request.getPassword(), student.getPassword())) {
                System.out.println("Student found and authenticated: " + email);
                return ResponseEntity.ok(Map.of(
                        "id", student.getId(),
                        "email", student.getEmail(),
                        "name", student.getName(),
                        "course", student.getCourse(),
                        "role", "STUDENT",
                        "firstLogin", student.getFirstLogin(),
                        "success", true));
            } else {
                System.out.println("Student found but password mismatch for: " + email);
            }
        }

        System.out.println("Authentication failed: User not found with email: " + email);
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
