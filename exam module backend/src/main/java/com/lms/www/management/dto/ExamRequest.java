package com.lms.www.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamRequest {
    private String title;
    private String instructions;
    private String description;
    private String course;
    private Integer durationMinutes;
    private Double passPercentage;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean randomize;
    private Integer maxAttempts;
    private Boolean tabLock;
    private Boolean fullscreenMode;
    private Double negativeMarks;
}
