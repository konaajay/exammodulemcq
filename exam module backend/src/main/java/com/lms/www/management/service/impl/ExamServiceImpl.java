package com.lms.www.management.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.lms.www.management.model.Exam;
import com.lms.www.management.model.Question;
import com.lms.www.management.model.QuestionSet;
import com.lms.www.management.repository.ExamRepository;
import com.lms.www.management.repository.QuestionRepository;
import com.lms.www.management.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final com.lms.www.management.service.QuestionService questionService;

    @Override
    @Transactional
    public Exam createExam(Exam exam) {
        if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
            QuestionSet initialSet = new QuestionSet();
            initialSet.setSetName("Paper 1");
            
            for (Question q : exam.getQuestions()) {
                q.setId(null);
                q.setCourse(exam.getCourse());
            }
            
            List<Question> savedQuestions = questionRepository.saveAll(exam.getQuestions());
            
            int totalMarks = savedQuestions.stream()
                .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1)
                .sum();
                
            initialSet.setQuestions(savedQuestions);
            exam.setTotalMarks(totalMarks);
            exam.getQuestionSets().add(initialSet);
        }
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

        // Manage through QuestionSet
        QuestionSet defaultSet = exam.getQuestionSets().stream()
                .filter(s -> "Default Paper".equals(s.getSetName()))
                .findFirst().orElse(null);
        if (defaultSet == null) {
            defaultSet = new QuestionSet();
            defaultSet.setSetName("Default Paper");
            exam.getQuestionSets().add(defaultSet);
        }
        defaultSet.getQuestions().clear();
        defaultSet.getQuestions().addAll(questions);
        
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
    public void uploadQuestionsToExam(Long examId, String setName, org.springframework.web.multipart.MultipartFile file, Integer marks) {
        Exam exam = getExamById(examId);
        
        // Step 1: Parse and save questions to the pool (tagged with exam course)
        List<Question> savedQuestions = questionService.saveBulkQuestionsWithReturn(file, exam.getCourse(), marks);
        
        // Step 2: Attach to exam under the specified QuestionSet
        if (setName == null || setName.isEmpty()) setName = "Paper 1";
        String finalSetName = setName;
        QuestionSet targetSet = exam.getQuestionSets().stream()
                .filter(s -> finalSetName.equals(s.getSetName()))
                .findFirst().orElse(null);
                
        if (targetSet == null) {
            targetSet = new QuestionSet();
            targetSet.setSetName(finalSetName);
            exam.getQuestionSets().add(targetSet);
        }
        
        targetSet.getQuestions().addAll(savedQuestions);
        
        // Step 3: Update total marks automatically based on the maximum total marks across all papers (sets)
        // This is necessary for exams with rotational papers where students only take one paper.
        int totalMaxMarks = 0;
        for (QuestionSet s : exam.getQuestionSets()) {
            int setTotal = s.getQuestions().stream()
                    .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1)
                    .sum();
            if (setTotal > totalMaxMarks) {
                totalMaxMarks = setTotal;
            }
        }
        exam.setTotalMarks(totalMaxMarks);
        
        examRepository.save(exam);
    }

    @Override
    @Transactional
    public Exam createExamWithQuestions(com.lms.www.management.dto.CreateExamRequest request) {
        com.lms.www.management.dto.ExamRequest details = request.getExamDetails();
        
        Exam exam = Exam.builder()
                .title(details.getTitle())
                .instructions(details.getInstructions())
                .description(details.getDescription())
                .course(details.getCourse())
                .durationMinutes(details.getDurationMinutes())
                .passPercentage(details.getPassPercentage())
                .startTime(details.getStartTime())
                .endTime(details.getEndTime())
                .randomize(details.getRandomize() != null ? details.getRandomize() : false)
                .maxAttempts(details.getMaxAttempts() != null ? details.getMaxAttempts() : 1)
                .allowReattempt(details.getMaxAttempts() != null && details.getMaxAttempts() > 1)
                .tabLock(details.getTabLock() != null ? details.getTabLock() : false)
                .fullscreenMode(details.getFullscreenMode() != null ? details.getFullscreenMode() : false)
                .negativeMarks(details.getNegativeMarks() != null ? details.getNegativeMarks() : 0.0)
                .status("PUBLISHED")
                .createdAt(java.time.LocalDateTime.now())
                .questionSets(new java.util.ArrayList<>())
                .build();

        List<com.lms.www.management.dto.QuestionSetRequest> setRequests = request.getQuestionSets();
        if ((setRequests == null || setRequests.isEmpty()) && request.getQuestions() != null) {
            com.lms.www.management.dto.QuestionSetRequest legacySet = new com.lms.www.management.dto.QuestionSetRequest();
            legacySet.setSetName("Paper 1");
            legacySet.setQuestions(request.getQuestions());
            setRequests = java.util.List.of(legacySet);
        }

        if (setRequests == null || setRequests.isEmpty()) {
            throw new RuntimeException("At least one question paper is required");
        }

        int totalMaxMarks = 0;
        for (com.lms.www.management.dto.QuestionSetRequest setReq : setRequests) {
            QuestionSet qSet = new QuestionSet();
            qSet.setSetName(setReq.getSetName() != null ? setReq.getSetName() : "Paper " + (exam.getQuestionSets().size() + 1));
            
            List<Question> batchQuestions = new java.util.ArrayList<>();
            int setTotalMarks = 0;

            for (com.lms.www.management.dto.QuestionRequest qReq : setReq.getQuestions()) {
                if (qReq == null || qReq.getQuestionText() == null) continue;
                
                Question q = mapToEntity(qReq);
                // Optimized Sync Logic: Check in memory/batch if possible, or just build list for saveAll
                Question existing = questionRepository.findByQuestionTextIgnoreCase(q.getQuestionText().trim()).orElse(null);
                if (existing != null) {
                    existing.setOptionA(q.getOptionA());
                    existing.setOptionB(q.getOptionB());
                    existing.setOptionC(q.getOptionC());
                    existing.setOptionD(q.getOptionD());
                    existing.setCorrectOption(q.getCorrectOption());
                    existing.setExplanation(q.getExplanation());
                    existing.setMarks(q.getMarks());
                    if (exam.getCourse() != null) existing.setCourse(exam.getCourse());
                    batchQuestions.add(existing);
                } else {
                    q.setId(null);
                    if (exam.getCourse() != null) q.setCourse(exam.getCourse());
                    batchQuestions.add(q);
                }
                setTotalMarks += (q.getMarks() != null ? q.getMarks() : 1);
            }
            
            qSet.setQuestions(questionRepository.saveAll(batchQuestions));
            exam.getQuestionSets().add(qSet);
            if (setTotalMarks > totalMaxMarks) totalMaxMarks = setTotalMarks;
        }

        exam.setTotalMarks(totalMaxMarks);
        return examRepository.save(exam);
    }

    private Question mapToEntity(com.lms.www.management.dto.QuestionRequest req) {
        return Question.builder()
                .questionText(req.getQuestionText())
                .optionA(req.getOptionA())
                .optionB(req.getOptionB())
                .optionC(req.getOptionC())
                .optionD(req.getOptionD())
                .correctOption(req.getCorrectOption())
                .explanation(req.getExplanation())
                .marks(req.getMarks())
                .build();
    }
}
