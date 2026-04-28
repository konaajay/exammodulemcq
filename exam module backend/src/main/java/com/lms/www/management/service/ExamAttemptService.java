package com.lms.www.management.service;

import com.lms.www.management.model.ExamAttempt;

public interface ExamAttemptService {

    ExamAttempt startAttempt(Long examId, Long studentId);

    ExamAttempt startPublicAttempt(Long examId, String name, String email);

    ExamAttempt submitAttempt(Long attemptId, Long studentId);

    ExamAttempt autoSubmitAttempt(Long attemptId, Long studentId);

    Object getResult(Long attemptId, Long studentId);

    java.util.List<com.lms.www.management.dto.QuestionDTO> getQuestionsForAttempt(Long attemptId);

    ExamAttempt getAttemptById(Long attemptId, Long studentId);

    // ================= EVALUATE ATTEMPT =================
    void evaluateAttempt(Long attemptId);

    // ================= GET RESULT =================

    ExamAttempt getAttemptByIdForSystem(Long attemptId);

    ExamAttempt updateAttemptStatus(ExamAttempt attempt);

    java.util.List<ExamAttempt> getAttemptsByExam(Long examId);

    java.util.List<ExamAttempt> getAttemptsByInstructor(Long instructorId);

    void saveResponse(Long attemptId, Long questionId, String selectedOption);

    java.util.List<ExamAttempt> getAttemptsByStudent(Long studentId, String email);
    
    java.util.Map<Long, String> getResponses(Long attemptId);
}
