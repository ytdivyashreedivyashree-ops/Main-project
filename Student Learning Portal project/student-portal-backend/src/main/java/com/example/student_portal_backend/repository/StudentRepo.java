package com.example.student_portal_backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.student_portal_backend.entity.StudentEntity;

public interface StudentRepo extends JpaRepository<StudentEntity, Long> {
    List<StudentEntity> findByCourseIgnoreCase(String course);
}