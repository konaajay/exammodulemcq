package com.lms.www.management.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lms.www.management.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    boolean existsByQuestionText(String questionText);
    java.util.Optional<Question> findByQuestionText(String questionText);
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM questions WHERE LOWER(question_text) = LOWER(:questionText) LIMIT 1", nativeQuery = true)
    java.util.Optional<Question> findByQuestionTextIgnoreCase(@org.springframework.data.repository.query.Param("questionText") String questionText);
    
    java.util.List<Question> findAllByQuestionTextIn(java.util.Collection<String> questionTexts);
}
