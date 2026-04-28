package com.lms.www.management.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.lms.www.management.model.*;
import com.lms.www.management.repository.*;
import com.lms.www.management.service.ExamAttemptService;
import com.lms.www.management.dto.QuestionDTO;
import com.lms.www.management.exception.ResourceNotFoundException;
import com.lms.www.management.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final ExamResponseRepository responseRepository;
    private final StudentRepository studentRepository;
    private final AttemptQuestionRepository attemptQuestionRepository;

    private static final String UTC_ZONE = "UTC";

    @Override
    @Transactional
    public ExamAttempt startAttempt(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        validateExamWindow(exam);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        int existingCount = attemptRepository.countByStudentIdAndExamId(studentId, exam.getId());
        if (existingCount >= exam.getMaxAttempts()) {
            throw new ValidationException("Access Restricted: Maximum attempts (" + exam.getMaxAttempts() + ") reached.");
        }
        
        int newAttemptNumber = existingCount + 1;
        Long questionSetId = selectQuestionSet(exam, newAttemptNumber);

        log.info("Creating attempt #{} for Student ID: {} on Exam ID: {}", newAttemptNumber, studentId, examId);

        ExamAttempt attempt = ExamAttempt.builder()
                .examId(exam.getId())
                .studentId(studentId)
                .studentName(student.getName())
                .studentEmail(student.getEmail())
                .startTime(LocalDateTime.now())
                .status("STARTED")
                .attemptNumber(newAttemptNumber)
                .questionSetId(questionSetId)
                .build();
        
        attempt = attemptRepository.saveAndFlush(attempt);
        log.info("Attempt persisted successfully with ID: {}. Generating question snapshots...", attempt.getId());
        snapshotQuestions(attempt, exam, questionSetId);
        
        return attempt;
    }

    @Override
    @Transactional
    public ExamAttempt startPublicAttempt(Long examId, String name, String email) {
        log.info("Starting public attempt for: {} on exam: {}", email, examId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        validateExamWindow(exam);
        
        int existingCount = attemptRepository.countByStudentEmailAndExamId(email, exam.getId());
        if (existingCount >= exam.getMaxAttempts()) {
            throw new ValidationException("Maximum attempts reached for this email.");
        }

        Long studentId = studentRepository.findByEmail(email).map(Student::getId).orElse(null);
        int newAttemptNumber = existingCount + 1;
        Long questionSetId = selectQuestionSet(exam, newAttemptNumber);

        ExamAttempt attempt = ExamAttempt.builder()
                .examId(exam.getId())
                .studentId(studentId)
                .studentName(name)
                .studentEmail(email)
                .startTime(LocalDateTime.now())
                .status("STARTED")
                .attemptNumber(newAttemptNumber)
                .questionSetId(questionSetId)
                .token(UUID.randomUUID().toString())
                .build();
        
        attempt = attemptRepository.save(attempt);
        snapshotQuestions(attempt, exam, questionSetId);
        
        return attempt;
    }

    private Long selectQuestionSet(Exam exam, int attemptNumber) {
        if (exam.getQuestionSets() != null && !exam.getQuestionSets().isEmpty()) {
            int setIndex = (attemptNumber - 1) % exam.getQuestionSets().size();
            return exam.getQuestionSets().get(setIndex).getId();
        }
        return null;
    }

    private void snapshotQuestions(ExamAttempt attempt, Exam exam, Long questionSetId) {
        if (questionSetId == null) return;

        exam.getQuestionSets().stream()
            .filter(s -> s.getId().equals(questionSetId))
            .findFirst()
            .ifPresent(s -> {
                List<AttemptQuestion> snapshots = s.getQuestions().stream().map(q -> AttemptQuestion.builder()
                        .attemptId(attempt.getId())
                        .questionId(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctOption(q.getCorrectOption())
                        .explanation(q.getExplanation())
                        .marks(q.getMarks())
                        .build()).collect(Collectors.toList());
                attemptQuestionRepository.saveAll(snapshots);
                log.info("Snapshot created for Attempt ID: {} with {} questions", attempt.getId(), snapshots.size());
            });
    }

    @Override
    @Transactional
    public void saveResponse(Long attemptId, Long questionId, String selectedOption) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        // 1. Validate Status
        if (!"STARTED".equals(attempt.getStatus())) {
            throw new RuntimeException("Cannot save response. Attempt is " + attempt.getStatus());
        }

        // 2. Validate Time
        Exam exam = examRepository.findById(attempt.getExamId()).orElseThrow();
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(attempt.getStartTime().plusMinutes(exam.getDurationMinutes() + 2))) { // 2 min grace
            log.warn("Time expired for attempt {}. Denying save.", attemptId);
            throw new RuntimeException("Exam time has expired");
        }

        // 3. Validate Question Ownership
        boolean isValidQuestion = attemptQuestionRepository.existsByAttemptIdAndQuestionId(attemptId, questionId);
        if (!isValidQuestion) {
            throw new RuntimeException("Question does not belong to this attempt");
        }

        // 4. Save/Update Response
        Optional<ExamResponse> existing = responseRepository.findByAttemptIdAndQuestionId(attemptId, questionId);
        ExamResponse response = existing.orElse(new ExamResponse());
        response.setAttemptId(attemptId);
        response.setQuestionId(questionId);
        response.setSelectedOption(selectedOption);
        responseRepository.save(response);
    }

    @Override
    @Transactional
    public ExamAttempt submitAttempt(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if ("COMPLETED".equals(attempt.getStatus())) {
            return attempt;
        }

        attempt.setStatus("COMPLETED");
        attempt.setEndTime(LocalDateTime.now());

        // Calculate score from snapshot
        Map<String, Object> result = (Map<String, Object>) getResult(attemptId, studentId);
        attempt.setScore(((Number) result.get("score")).doubleValue());
        
        return attemptRepository.save(attempt);
    }

    @Override
    public Object getResult(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        // Security: Only allow if COMPLETED
        if (!"COMPLETED".equals(attempt.getStatus())) {
            throw new ValidationException("Result not available until exam is submitted. Current status: " + attempt.getStatus());
        }

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        List<ExamResponse> responses = responseRepository.findByAttemptId(attemptId);
        
        // Use a standard loop to avoid Collectors.toMap NullPointerException on null values
        Map<Long, String> responseMap = new java.util.HashMap<>();
        for (ExamResponse r : responses) {
            responseMap.put(r.getQuestionId(), r.getSelectedOption());
        }

        List<AttemptQuestion> questions = attemptQuestionRepository.findByAttemptId(attemptId);
        List<Map<String, Object>> breakdown = new ArrayList<>();
        double score = 0;
        int correct = 0;
        int wrong = 0;

        for (AttemptQuestion q : questions) {
            String selected = responseMap.get(q.getQuestionId());
            boolean isCorrect = q.getCorrectOption() != null && q.getCorrectOption().equalsIgnoreCase(selected);
            
            Map<String, Object> detail = new HashMap<>();
            detail.put("questionId", q.getQuestionId());
            detail.put("question", q.getQuestionText()); // Frontend expects 'question'
            detail.put("questionText", q.getQuestionText());
            detail.put("selected", selected);
            detail.put("correct", q.getCorrectOption());
            detail.put("explanation", q.getExplanation());
            detail.put("isCorrect", isCorrect);
            detail.put("status", selected == null ? "NOT_ATTEMPTED" : (isCorrect ? "CORRECT" : "WRONG")); // Frontend expects 'status'
            detail.put("marks", q.getMarks());
            
            if (selected != null) {
                if (isCorrect) {
                    score += q.getMarks();
                    correct++;
                } else {
                    score -= exam.getNegativeMarks();
                    wrong++;
                }
            }
            breakdown.add(detail);
        }

        double totalPossible = questions.stream().mapToDouble(AttemptQuestion::getMarks).sum();
        double percentage = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
        boolean passed = percentage >= (exam.getPassPercentage() != null ? exam.getPassPercentage() : 40);

        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("score", score);
        finalResult.put("total", totalPossible); // Mapping totalPossible to 'total' for frontend
        finalResult.put("totalPossible", totalPossible);
        finalResult.put("percentage", Math.round(percentage * 100.0) / 100.0);
        finalResult.put("passed", passed);
        finalResult.put("correct", correct);
        finalResult.put("wrong", wrong);
        finalResult.put("notAttempted", questions.size() - (correct + wrong));
        finalResult.put("totalQuestions", questions.size());
        finalResult.put("answers", breakdown);
        return finalResult;
    }

    @Override
    public List<QuestionDTO> getQuestionsForAttempt(Long attemptId) {
        List<AttemptQuestion> snapshots = attemptQuestionRepository.findByAttemptId(attemptId);
        return snapshots.stream().map(aq -> QuestionDTO.builder()
                .id(aq.getQuestionId())
                .questionText(aq.getQuestionText())
                .optionA(aq.getOptionA())
                .optionB(aq.getOptionB())
                .optionC(aq.getOptionC())
                .optionD(aq.getOptionD())
                .marks(aq.getMarks())
                .build()).collect(Collectors.toList());
    }

    @Override
    public Map<Long, String> getResponses(Long attemptId) {
        return responseRepository.findByAttemptId(attemptId).stream()
                .collect(Collectors.toMap(ExamResponse::getQuestionId, ExamResponse::getSelectedOption, (a, b) -> b));
    }

    @Override
    public ExamAttempt autoSubmitAttempt(Long attemptId, Long studentId) {
        return submitAttempt(attemptId, studentId);
    }

    @Override public ExamAttempt getAttemptById(Long attemptId, Long studentId) { return attemptRepository.findById(attemptId).orElse(null); }
    @Override public void evaluateAttempt(Long attemptId) { /* Logic integrated in submit */ }
    @Override public ExamAttempt getAttemptByIdForSystem(Long attemptId) { return attemptRepository.findById(attemptId).orElse(null); }
    @Override public ExamAttempt updateAttemptStatus(ExamAttempt attempt) { return attemptRepository.save(attempt); }
    @Override public List<ExamAttempt> getAttemptsByExam(Long examId) { return attemptRepository.findByExamId(examId); }
    @Override public List<ExamAttempt> getAttemptsByInstructor(Long instructorId) { return List.of(); }

    @Override
    public List<ExamAttempt> getAttemptsByStudent(Long studentId, String email) {
        return attemptRepository.findByStudentIdOrStudentEmailOrderByStartTimeDesc(studentId, email);
    }

    private void validateExamWindow(Exam exam) {
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new ValidationException("Exam has not started yet (Scheduled for " + exam.getStartTime() + ")");
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new ValidationException("Exam has already ended.");
        }
    }
}