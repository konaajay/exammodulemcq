package com.lms.www.management.service.impl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.www.management.model.Question;
import com.lms.www.management.repository.QuestionRepository;
import com.lms.www.management.service.QuestionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;

    @Override
    public void saveBulkQuestions(MultipartFile file, String course) {
        saveBulkQuestionsWithReturn(file, course);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<Question> saveBulkQuestionsWithReturn(MultipartFile file, String course) {
        List<Question> questions = parseCsvToQuestions(file);
        for (Question q : questions) {
            q.setCourse(course);
            
            // Sync with existing if necessary (optional depending on desired behavior)
            Question existing = questionRepository.findByQuestionTextIgnoreCase(q.getQuestionText().trim()).orElse(null);
            if (existing != null) {
                existing.setOptionA(q.getOptionA());
                existing.setOptionB(q.getOptionB());
                existing.setOptionC(q.getOptionC());
                existing.setOptionD(q.getOptionD());
                existing.setCorrectOption(q.getCorrectOption());
                existing.setExplanation(q.getExplanation());
                existing.setMarks(q.getMarks());
                existing.setCourse(course);
                questionRepository.save(existing);
            } else {
                questionRepository.save(q);
            }
        }
        return questions;
    }

    @Override
    public List<Question> parseCsv(MultipartFile file) {
        return parseCsvToQuestions(file);
    }

    private List<Question> parseCsvToQuestions(MultipartFile file) {
        java.util.List<Question> questions = new java.util.ArrayList<>();
        if (file == null || file.isEmpty()) return questions;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String header = br.readLine(); // skip header
            if (header == null) return questions;

            String line;
            int rowNum = 1;
            while ((line = br.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) continue;
                try {
                    // Regex handles commas inside quotes
                    String[] data = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                    if (data.length < 6) {
                        System.err.println("Row " + rowNum + " has insufficient columns: " + data.length);
                        continue;
                    }
                    
                    Question q = new Question();
                    q.setQuestionText(data[0].replace("\"", "").trim());
                    q.setOptionA(data.length > 1 ? data[1].replace("\"", "").trim() : "");
                    q.setOptionB(data.length > 2 ? data[2].replace("\"", "").trim() : "");
                    q.setOptionC(data.length > 3 ? data[3].replace("\"", "").trim() : "");
                    q.setOptionD(data.length > 4 ? data[4].replace("\"", "").trim() : "");
                    q.setCorrectOption(data.length > 5 ? data[5].replace("\"", "").trim() : "A");
                    q.setExplanation(data.length > 6 ? data[6].replace("\"", "").trim() : "");
                    
                    int marks = 1;
                    if (data.length > 7) {
                        try {
                            String marksStr = data[7].replace("\"", "").trim();
                            marks = Integer.parseInt(marksStr);
                        } catch (Exception e) {}
                    }
                    q.setMarks(marks);
                    questions.add(q);
                } catch (Exception rowEx) {
                    System.err.println("Error parsing row " + rowNum + ": " + rowEx.getMessage());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("CSV Parsing Error: " + e.getMessage());
        }
        return questions;
    }

    @Override
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Override
    public Question saveQuestion(Question question) {
        // Smart Manual Sync: If question exists, update it instead of throwing error
        Question q = questionRepository.findByQuestionTextIgnoreCase(question.getQuestionText().trim())
                .orElse(question);
        
        // Ensure properties are copied if it was found
        if (q.getId() != null) {
            q.setOptionA(question.getOptionA());
            q.setOptionB(question.getOptionB());
            q.setOptionC(question.getOptionC());
            q.setOptionD(question.getOptionD());
            q.setCorrectOption(question.getCorrectOption());
            q.setExplanation(question.getExplanation());
            q.setCourse(question.getCourse());
            q.setMarks(question.getMarks());
        }
        
        return questionRepository.save(q);
    }

    @Override
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
