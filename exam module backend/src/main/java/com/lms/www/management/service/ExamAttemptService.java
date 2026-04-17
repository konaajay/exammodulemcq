package com.lms.www.management.service;

import com.lms.www.management.model.ExamAttempt;

public interface ExamAttemptService {

    ExamAttempt startAttempt(Long examId, Long studentId);

    ExamAttempt startPublicAttempt(Long examId, String name, String email);

    ExamAttempt submitAttempt(Long attemptId, Long studentId);

    ExamAttempt autoSubmitAttempt(Long attemptId, Long studentId);

    ExamAttempt getAttemptById(Long attemptId, Long studentId);

    // ================= EVALUATE ATTEMPT =================
    void evaluateAttempt(Long attemptId);

    // ================= GET RESULT =================
    Object getResult(Long attemptId, Long studentId);
    
    ExamAttempt getAttemptByIdForSystem(Long attemptId);

    ExamAttempt updateAttemptStatus(ExamAttempt attempt);

    java.util.List<ExamAttempt> getAttemptsByExam(Long examId);

    java.util.List<ExamAttempt> getAttemptsByInstructor(Long instructorId);

    void saveResponse(Long attemptId, Long questionId, String selectedOption);

    java.util.List<ExamAttempt> getAttemptsByStudent(Long studentId);
}
