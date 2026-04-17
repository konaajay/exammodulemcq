package com.lms.www.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms.www.management.model.Exam;
import com.lms.www.management.service.ExamService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        // Exam object will automatically map fields from JSON (startTime, endTime,
        // etc.)
        return ResponseEntity.ok(examService.createExam(exam));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.softDeleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign-questions")
    public ResponseEntity<Void> assignQuestions(@PathVariable Long id, @RequestBody List<Long> questionIds) {
        examService.assignQuestions(id, questionIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Exam> publishExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.publishExam(id));
    }

    @PostMapping("/{id}/upload-questions")
    public ResponseEntity<com.lms.www.management.dto.ApiResponse> uploadQuestions(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        examService.uploadQuestionsToExam(id, file);
        return ResponseEntity.ok(new com.lms.www.management.dto.ApiResponse(true, "Questions uploaded and attached to exam successfully"));
    }

    @PostMapping("/create-with-questions")
    public ResponseEntity<Exam> createExamWithQuestions(@RequestBody com.lms.www.management.dto.CreateExamRequest request) {
        return ResponseEntity.ok(examService.createExamWithQuestions(request));
    }
}
