package com.lms.www.management.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lms.www.management.model.ExamResponse;

public interface ExamResponseRepository extends JpaRepository<ExamResponse, Long> {
    List<ExamResponse> findByAttemptId(Long attemptId);
    Optional<ExamResponse> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}