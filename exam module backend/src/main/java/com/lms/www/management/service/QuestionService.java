package com.lms.www.management.service;

import org.springframework.web.multipart.MultipartFile;
import com.lms.www.management.model.Question;
import java.util.List;

public interface QuestionService {
    void saveBulkQuestions(MultipartFile file, String course); 
    List<Question> saveBulkQuestionsWithReturn(MultipartFile file, String course);
    List<Question> getAllQuestions();
    Question getQuestionById(Long id);
    Question saveQuestion(Question question);
    void deleteQuestion(Long id);
    List<Question> parseCsv(MultipartFile file);
}
