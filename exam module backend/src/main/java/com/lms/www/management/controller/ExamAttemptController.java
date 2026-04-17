package com.lms.www.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lms.www.management.model.ExamAttempt;
import com.lms.www.management.service.ExamAttemptService;
import com.lms.www.management.util.SecurityUtil;

import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExamAttemptController {

    private final ExamAttemptService examAttemptService;
    private final SecurityUtil securityUtil;

    @GetMapping("/attempts/my")
    public ResponseEntity<?> getMyAttempts() {
        Long studentId = securityUtil.getUserId();
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId));
    }

    @PostMapping("/{examId}/attempts/start")
    public ResponseEntity<ExamAttempt> startAttempt(
            @PathVariable Long examId) {

        Long studentId = securityUtil.getUserId();
        return ResponseEntity.ok(examAttemptService.startAttempt(examId, studentId));
    }

    @PostMapping("/{examId}/attempts/public-start")
    public ResponseEntity<ExamAttempt> startPublicAttempt(
            @PathVariable Long examId,
            @RequestBody Map<String, String> request) {

        String name = request.get("name");
        String email = request.get("email");
        return ResponseEntity.ok(examAttemptService.startPublicAttempt(examId, name, email));
    }

    @PostMapping("/attempts/{attemptId}/responses")
    public ResponseEntity<?> saveResponse(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Object> request) {

        String selectedOption = (String) request.get("selectedOption");
        Long questionId = Long.valueOf(request.get("questionId").toString());
        
        examAttemptService.saveResponse(attemptId, questionId, selectedOption);
        return ResponseEntity.ok("Response saved and evaluated");
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ExamAttempt> submitAttempt(
            @PathVariable Long attemptId) {

        Long studentId = securityUtil.getUserId(); 
        return ResponseEntity.ok(examAttemptService.submitAttempt(attemptId, studentId));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<?> getResult(
            @PathVariable Long attemptId) {

        Long studentId = securityUtil.getUserId();
        return ResponseEntity.ok(examAttemptService.getResult(attemptId, studentId));
    }

    @GetMapping("/{examId}/attempts/all")
    public ResponseEntity<?> getAttemptsByExam(
            @PathVariable Long examId) {

        return ResponseEntity.ok(examAttemptService.getAttemptsByExam(examId));
    }

    @GetMapping("/attempts/student/{studentId}")
    public ResponseEntity<?> getAttemptsByStudentId(
            @PathVariable Long studentId) {
        
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId));
    }
}