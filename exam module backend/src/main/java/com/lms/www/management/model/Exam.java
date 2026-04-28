package com.lms.www.management.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE exams SET deleted = true WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("deleted = false")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private String description;
    private String course;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "pass_percentage")
    private Double passPercentage;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime startTime;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime endTime;

    @Builder.Default
    private Boolean randomize = false;

    @Builder.Default
    private Integer maxAttempts = 1;

    @Builder.Default
    private Boolean allowReattempt = false;

    @Builder.Default
    private Boolean tabLock = false;

    @Builder.Default
    private Boolean fullscreenMode = false;

    @Builder.Default
    private Double negativeMarks = 0.0;

    @Builder.Default
    private Boolean deleted = false;

    private String status;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id")
    @Builder.Default
    private List<QuestionSet> questionSets = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(java.time.ZoneId.of("UTC"));
        if (this.status == null)
            this.status = "DRAFT";
        if (this.deleted == null)
            this.deleted = false;
    }
}
