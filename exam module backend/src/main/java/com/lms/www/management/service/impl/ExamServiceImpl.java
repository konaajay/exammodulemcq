package com.lms.www.management.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.lms.www.management.model.Exam;
import com.lms.www.management.model.Question;
import com.lms.www.management.repository.ExamRepository;
import com.lms.www.management.repository.QuestionRepository;
import com.lms.www.management.service.ExamService;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final com.lms.www.management.service.QuestionService questionService;

    @Override
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    @Override
    @Transactional
    public void assignQuestions(Long examId, List<Long> questionIds) {
        Exam exam = getExamById(examId);
        List<Question> questions = questionRepository.findAllById(questionIds);

        // Sync Total Marks: Automatically update to match the sum of assigned questions
        int sumMarks = questions.stream()
                .mapToInt(Question::getMarks)
                .sum();

        exam.setTotalMarks(sumMarks);

        // JPA @ManyToMany handle: Clear old and add new set
        exam.getQuestions().clear();
        exam.getQuestions().addAll(questions);
        examRepository.save(exam);
    }

    @Override
    public Exam publishExam(Long examId) {
        Exam exam = getExamById(examId);
        exam.setStatus("PUBLISHED");
        return examRepository.save(exam);
    }

    @Override
    public Exam closeExam(Long examId) {
        Exam exam = getExamById(examId);
        exam.setStatus("CLOSED");
        return examRepository.save(exam);
    }

    @Override
    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    @Override
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @Override
    public void softDeleteExam(Long examId) {
        examRepository.deleteById(examId);
    }

    @Override
    public void restoreExam(Long examId) { }

    @Override
    public void hardDeleteExam(Long examId) {
        examRepository.deleteById(examId);
    }

    @Override
    public List<Exam> getSoftDeletedExams() {
        return List.of();
    }

    @Override
    @Transactional
    public void uploadQuestionsToExam(Long examId, org.springframework.web.multipart.MultipartFile file) {
        Exam exam = getExamById(examId);
        
        // Step 1: Parse and save questions to the pool (tagged with exam course)
        List<Question> savedQuestions = questionService.saveBulkQuestionsWithReturn(file, exam.getCourse());
        
        // Step 2: Attach to exam
        exam.getQuestions().addAll(savedQuestions);
        
        // Step 3: Update total marks automatically based on uploaded questions
        int totalMarks = savedQuestions.stream()
                .mapToInt(Question::getMarks)
                .sum();
        exam.setTotalMarks(totalMarks);
        
        examRepository.save(exam);
    }

    @Override
    @Transactional
    public Exam createExamWithQuestions(com.lms.www.management.dto.CreateExamRequest request) {
        Exam exam = request.getExamDetails();
        List<Question> questions = request.getQuestions();
        
        // Ensure the createdAt is set or it might be null if manually provided in JSON
        if (exam.getCreatedAt() == null) {
            exam.setCreatedAt(java.time.LocalDateTime.now());
        }

        // Phase 1: Persist/Sync Questions
        java.util.List<Question> persistedQuestions = new java.util.ArrayList<>();
        int calculatedTotalMarks = 0;
        
        for (Question q : questions) {
            if (q == null || q.getQuestionText() == null) continue;
            
            calculatedTotalMarks += q.getMarks();
            
            // Check for existence by text to avoid duplicates in the global bank
            Question existing = questionRepository.findByQuestionTextIgnoreCase(q.getQuestionText().trim()).orElse(null);
            if (existing != null) {
                existing.setOptionA(q.getOptionA());
                existing.setOptionB(q.getOptionB());
                existing.setOptionC(q.getOptionC());
                existing.setOptionD(q.getOptionD());
                existing.setCorrectOption(q.getCorrectOption());
                existing.setExplanation(q.getExplanation());
                existing.setMarks(q.getMarks());
                existing.setCourse(exam.getCourse());
                persistedQuestions.add(questionRepository.save(existing));
            } else {
                q.setId(null); 
                q.setCourse(exam.getCourse());
                persistedQuestions.add(questionRepository.save(q));
            }
        }
        
        // Phase 2: Save Exam
        exam.setTotalMarks(calculatedTotalMarks);
        exam.setQuestions(persistedQuestions);
        
        return examRepository.save(exam);
    }
}
