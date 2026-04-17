package com.lms.www.management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id")
    private Long attemptId;

    @Column(name = "question_id")
    private Long questionId;

    private String selectedOption; // "A", "B", "C", "D"
    
    private Boolean isCorrect;

    // Status to track if it's purely saved or marked for review as seen in Pro UI
    @Builder.Default
    private String status = "SAVED"; 
}
