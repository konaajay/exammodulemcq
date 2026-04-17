package com.lms.www.management.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.lms.www.management.model.Student;
import com.lms.www.management.repository.StudentRepository;
import com.lms.www.management.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Student enrollStudent(Student student) {
        // Data Sanitization: Ensure emails are lowercase and trimmed to prevent login failures
        if (student.getEmail() != null) student.setEmail(student.getEmail().toLowerCase().trim());
        if (student.getPhone() != null) student.setPhone(student.getPhone().trim());

        // Generate password: first 4 of email + @ + first 4 of phone
        String p1 = student.getEmail().split("@")[0];
        if (p1.length() > 4) p1 = p1.substring(0, 4);
        
        String p2 = student.getPhone();
        if (p2.length() > 4) p2 = p2.substring(0, 4);
        
        String generatedPassword = p1 + "@" + p2;
        student.setPassword(passwordEncoder.encode(generatedPassword));
        student.setFirstLogin(true);
        
        log.info("Enrolling student: {} with sanitized secure credentials", student.getEmail());
        return studentRepository.save(student);
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @org.springframework.transaction.annotation.Transactional
    public void repairPasswords() {
        log.info("Security Audit: Checking for non-BCrypt passwords...");
        List<Student> students = studentRepository.findAll();
        long repaired = 0;
        for (Student s : students) {
            String p = s.getPassword();
            // BCrypt hashes start with $2a$, $2b$ or $2y$ and are 60 chars long
            if (p != null && !p.startsWith("$2")) {
                log.warn("Repairing plain-text password for student: {}", s.getEmail());
                s.setPassword(passwordEncoder.encode(p));
                studentRepository.save(s);
                repaired++;
            }
        }
        if (repaired > 0) log.info("Security Audit Complete: {} passwords secured.", repaired);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
