package com.example.student_portal_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.MarksEntity;

public interface MarksRepo extends JpaRepository<MarksEntity, Long> {
    List<MarksEntity> findByStudentId(Long studentId);
    List<MarksEntity> findByTeacherId(Long teacherId);
}
