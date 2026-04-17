package com.lms.www.management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "question_option")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long optionId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "option_text", columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Transient
    private String explanation;

    @Builder.Default
    @Transient
    private Integer optionOrder = 0;

    // --- Restored Fields for Service Compatibility ---

    @Column(name = "option_image_url")
    private String optionImageUrl;

}