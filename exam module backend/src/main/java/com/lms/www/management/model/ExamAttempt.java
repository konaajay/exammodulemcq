package com.lms.www.management.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;
    private Long studentId; // Can be null for guest attempts
    private String token; // Unique session token for guest access
    
    private String studentName; // For public link access
    private String studentEmail; // For public link access
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime submittedAt;
    
    private Double score;
    private Integer attemptNumber;
    private String status; // IN_PROGRESS, SUBMITTED

    @PrePersist
    protected void onCreate() {
        if (this.startTime == null) this.startTime = LocalDateTime.now();
        if (this.status == null) this.status = "IN_PROGRESS";
    }
}
