package com.lms.www.management.repository;

import com.lms.www.management.model.AttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttemptQuestionRepository extends JpaRepository<AttemptQuestion, Long> {
    List<AttemptQuestion> findByAttemptId(Long attemptId);
    boolean existsByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
