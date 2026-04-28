package com.lms.www.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExamRequest {
    private ExamRequest examDetails;
    private List<QuestionSetRequest> questionSets;
    private List<QuestionRequest> questions; // Keeping for backward compatibility
}
