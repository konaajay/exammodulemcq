package com.lms.www.management.dto;

import lombok.Data;

@Data
public class QuestionRequest {
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private String explanation;
    private Integer marks;
}
