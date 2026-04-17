package com.lms.www.management.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms.www.management.model.Student;
import com.lms.www.management.service.StudentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/create")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        Student saved = studentService.enrollStudent(student);

        String p1 = saved.getEmail().split("@")[0];
        if (p1.length() > 4)
            p1 = p1.substring(0, 4);
        String p2 = saved.getPhone() != null ? saved.getPhone() : "1234";
        if (p2.length() > 4)
            p2 = p2.substring(0, 4);
        String rawPassword = p1 + "@" + p2;

        Map<String, String> response = new HashMap<>();
        response.put("username", saved.getEmail());
        response.put("password", rawPassword);
        response.put("success", "true");

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
