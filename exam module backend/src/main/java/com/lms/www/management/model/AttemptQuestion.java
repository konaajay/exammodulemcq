package com.lms.www.management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attempt_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long attemptId;
    private Long questionId; // Reference to original question

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String optionA;
    @Column(columnDefinition = "TEXT")
    private String optionB;
    @Column(columnDefinition = "TEXT")
    private String optionC;
    @Column(columnDefinition = "TEXT")
    private String optionD;

    private String correctOption;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    private Integer marks;
}
