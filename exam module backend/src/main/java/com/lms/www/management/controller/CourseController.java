package com.lms.www.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms.www.management.model.Course;
import com.lms.www.management.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CourseController {

    private final CourseRepository courseRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        if (courseRepository.existsByName(course.getName())) {
            return ResponseEntity.status(400).body("Course already exists");
        }
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Course not found");
        }
        // Ideally check if students/exams are linked before deleting
        courseRepository.deleteById(id);
        return ResponseEntity.ok("Course deleted successfully");
    }
}
