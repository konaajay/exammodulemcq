package com.lms.www.management.service;

import java.util.List;
import com.lms.www.management.model.Student;

public interface StudentService {
    Student enrollStudent(Student student);
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    void deleteStudent(Long id);
}
