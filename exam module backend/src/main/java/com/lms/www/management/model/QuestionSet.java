package com.lms.www.management.model;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String setName; // e.g. "Paper 1", "Paper 2"

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "question_set_questions", 
               joinColumns = @JoinColumn(name = "set_id"), 
               inverseJoinColumns = @JoinColumn(name = "question_id"))
    @Builder.Default
    private List<Question> questions = new ArrayList<>();
}
