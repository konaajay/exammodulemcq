package com.lms.www.management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.www.management.model.Question;
import com.lms.www.management.service.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/upload-mcq")
    public ResponseEntity<List<Question>> upload(@RequestParam("file") MultipartFile file, @RequestParam("course") String course) {
        return ResponseEntity.ok(questionService.saveBulkQuestionsWithReturn(file, course));
    }

    @PostMapping("/parse-csv")
    public ResponseEntity<List<Question>> parseCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(questionService.parseCsv(file));
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.saveQuestion(question));
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestion(@PathVariable Long id) {
        Question q = questionService.getQuestionById(id);
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(q);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}