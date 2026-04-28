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
        String email = null; // Extraction strategy not available in SecurityUtil
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId, email));
    }

    @PostMapping("/{examId}/attempts/start")
    public ResponseEntity<ExamAttempt> startAttempt(
            @PathVariable Long examId,
            @RequestBody(required = false) java.util.Map<String, Object> request) {

        Long studentId = securityUtil.getUserId();
        
        // Fallback: If security util returns default 1L (dummy), check if request body provides a better ID
        if (studentId == 1L && request != null && request.get("studentId") != null) {
            try {
                studentId = Long.valueOf(request.get("studentId").toString());
            } catch (Exception e) {}
        }
        
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

    @GetMapping("/attempts/{attemptId}/questions")
    public ResponseEntity<?> getAttemptQuestions(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(examAttemptService.getQuestionsForAttempt(attemptId));
    }

    @GetMapping("/attempts/{attemptId}/responses")
    public ResponseEntity<?> getResponses(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(examAttemptService.getResponses(attemptId));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ExamAttempt> getAttempt(
            @PathVariable Long attemptId) {
        return ResponseEntity.ok(examAttemptService.getAttemptByIdForSystem(attemptId));
    }

    @GetMapping("/{examId}/attempts/all")
    public ResponseEntity<?> getAttemptsByExam(
            @PathVariable Long examId) {

        return ResponseEntity.ok(examAttemptService.getAttemptsByExam(examId));
    }

    @GetMapping("/attempts/student/{studentId}")
    public ResponseEntity<?> getAttemptsByStudentId(
            @PathVariable Long studentId) {
        
        return ResponseEntity.ok(examAttemptService.getAttemptsByStudent(studentId, null));
    }
}