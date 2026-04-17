package com.lms.www.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lms.www.management.model.ExamAttempt;
import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByExamId(Long examId);
    List<ExamAttempt> findByStudentId(Long studentId);
    List<ExamAttempt> findByStudentIdOrderByStartTimeDesc(Long studentId);
    List<ExamAttempt> findByStudentIdAndExamIdOrderByAttemptNumberDesc(Long studentId, Long examId);
    int countByStudentIdAndExamId(Long studentId, Long examId);
}