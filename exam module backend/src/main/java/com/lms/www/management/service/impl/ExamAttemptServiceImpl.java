package com.lms.www.management.service.impl;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.lms.www.management.model.*;
import com.lms.www.management.repository.*;
import com.lms.www.management.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamResponseRepository responseRepository;
    private final StudentRepository studentRepository;

    @Override
    public ExamAttempt startAttempt(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        validateExamWindow(exam);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ExamAttempt attempt = ExamAttempt.builder()
                .examId(exam.getId())
                .studentId(studentId)
                .studentName(student.getName())
                .studentEmail(student.getEmail())
                .startTime(LocalDateTime.now())
                .status("STARTED")
                .build();
        return attemptRepository.save(attempt);
    }

    @Override
    public ExamAttempt startPublicAttempt(Long examId, String name, String email) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        validateExamWindow(exam);
        
        // Check Attempt Limits (By Email for public attempts)
        int existingCount = attemptRepository.countByStudentEmailAndExamId(email, exam.getId());
        if (existingCount >= exam.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts (" + exam.getMaxAttempts() + ") reached for this email.");
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .examId(exam.getId()).studentName(name).studentEmail(email)
                .startTime(LocalDateTime.now()).status("STARTED")
                .token(UUID.randomUUID().toString()).build();
        return attemptRepository.save(attempt);
    }

    private void validateExamWindow(Exam exam) {
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) 
            throw new RuntimeException("Exam starts at: " + exam.getStartTime());
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) 
            throw new RuntimeException("Exam closed at: " + exam.getEndTime());
    }

    @Override
    @Transactional
    public void saveResponse(Long attemptId, Long questionId, String selectedOption) {
        // Save or Update selection for real-time tracking
        ExamResponse response = responseRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElse(ExamResponse.builder().attemptId(attemptId).questionId(questionId).build());
        
        // Calculate correctness on-the-fly to satisfy DB constraints and speed up result generation
        Question question = questionRepository.findById(questionId).orElse(null);
        if (question != null) {
            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(selectedOption);
            response.setIsCorrect(isCorrect);
        } else {
            response.setIsCorrect(false); // Default for safety
        }

        response.setSelectedOption(selectedOption);
        responseRepository.save(response);
    }

    @Override
    @Transactional
    public ExamAttempt submitAttempt(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        attempt.setEndTime(LocalDateTime.now());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus("COMPLETED");
        
        // Calculate Attempt Number based on available identification (ID or Email)
        int count;
        if (attempt.getStudentId() != null) {
            count = attemptRepository.countByStudentIdAndExamId(attempt.getStudentId(), attempt.getExamId());
        } else {
            count = attemptRepository.countByStudentEmailAndExamId(attempt.getStudentEmail(), attempt.getExamId());
        }
        attempt.setAttemptNumber(count + 1);

        // Final score calculation before saving
        Map<String, Object> resultData = (Map<String, Object>) getResult(attemptId, studentId);
        attempt.setScore(((Number) resultData.get("score")).doubleValue());
        
        return attemptRepository.save(attempt);
    }

    @Override
    public ExamAttempt autoSubmitAttempt(Long attemptId, Long studentId) {
        return submitAttempt(attemptId, studentId);
    }

    @Override
    public Object getResult(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        Exam exam = examRepository.findById(attempt.getExamId()).orElse(null);
        
        List<ExamResponse> responses = responseRepository.findByAttemptId(attemptId);
        Map<Long, String> responseMap = responses.stream()
                .collect(Collectors.toMap(ExamResponse::getQuestionId, ExamResponse::getSelectedOption));

        List<Question> questions = exam != null ? exam.getQuestions() : List.of();
        List<Map<String, Object>> breakdown = new ArrayList<>();
        double score = 0;
        int correct = 0;
        int wrong = 0;
        int notAttempted = 0;

        for (Question q : questions) {
            String selected = responseMap.get(q.getId());
            boolean isCorrect = q.getCorrectOption() != null && q.getCorrectOption().equalsIgnoreCase(selected);
            
            String status = "NOT_ATTEMPTED";
            if (selected != null) {
                if (isCorrect) {
                   score += q.getMarks();
                   correct++;
                   status = "CORRECT";
                } else {
                   score -= (exam != null ? exam.getNegativeMarks() : 0);
                   wrong++;
                   status = "WRONG";
                }
            } else {
                notAttempted++;
            }

            Map<String, Object> detail = new HashMap<>();
            detail.put("question", q.getQuestionText());
            detail.put("selected", selected);
            detail.put("correct", q.getCorrectOption());
            detail.put("status", status);
            detail.put("explanation", q.getExplanation());
            breakdown.add(detail);
        }

        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("score", score);
        finalResult.put("total", exam != null ? exam.getTotalMarks() : 0);
        finalResult.put("totalQuestions", questions.size());
        finalResult.put("correct", correct);
        finalResult.put("wrong", wrong);
        finalResult.put("notAttempted", notAttempted);
        finalResult.put("attemptNumber", attempt.getAttemptNumber());
        finalResult.put("answers", breakdown);
        return finalResult;
    }

    @Override public ExamAttempt getAttemptById(Long attemptId, Long studentId) { return attemptRepository.findById(attemptId).orElse(null); }
    @Override public void evaluateAttempt(Long attemptId) { }
    @Override public ExamAttempt getAttemptByIdForSystem(Long attemptId) { return attemptRepository.findById(attemptId).orElse(null); }
    @Override public ExamAttempt updateAttemptStatus(ExamAttempt attempt) { return attemptRepository.save(attempt); }
    @Override public List<ExamAttempt> getAttemptsByExam(Long examId) { return attemptRepository.findByExamId(examId); }
    @Override public List<ExamAttempt> getAttemptsByInstructor(Long instructorId) { return List.of(); }

    @Override
    public List<ExamAttempt> getAttemptsByStudent(Long studentId) {
        return attemptRepository.findByStudentId(studentId);
    }
}