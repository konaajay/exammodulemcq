package com.lms.www.management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", length = 1000)
    private String questionText;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    @Column(name = "correct_option")
    private String correctOption; // "A" / "B" / "C" / "D"

    private String course;

    @Column(length = 1000)
    private String explanation;

    @Builder.Default
    private Integer marks = 1;

    // Standard constructor for easy creation
    public Question(String questionText, String optionA, String optionB, String optionC, String optionD, String correctOption, String explanation, Integer marks) {
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.explanation = explanation;
        this.marks = marks;
    }
}