package com.lms.www.management.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionDTO {
    private Long id;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String course;
    private Integer marks;
    // Note: correctOption and explanation are EXCLUDED
}
