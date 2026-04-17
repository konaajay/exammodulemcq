package com.lms.www.management.dto;

import com.lms.www.management.model.Exam;
import com.lms.www.management.model.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExamRequest {
    private Exam examDetails;
    private List<Question> questions;
}
