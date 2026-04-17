package com.lms.www.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lms.www.management.model.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
}
