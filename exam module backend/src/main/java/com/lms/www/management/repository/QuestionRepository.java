package com.lms.www.management.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lms.www.management.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    boolean existsByQuestionTextIgnoreCase(String questionText);
    java.util.Optional<Question> findByQuestionTextIgnoreCase(String questionText);
    java.util.List<Question> findAllByQuestionTextInIgnoreCase(java.util.Collection<String> questionTexts);
}
