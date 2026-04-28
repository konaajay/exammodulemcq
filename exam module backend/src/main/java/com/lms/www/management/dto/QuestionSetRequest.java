package com.lms.www.management.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionSetRequest {
    private String setName;
    private List<QuestionRequest> questions;
}
