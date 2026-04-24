package com.example.student_portal_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.CourseEntity;

public interface CourseRepo extends JpaRepository<CourseEntity, Long> {
    Optional<CourseEntity> findByNameIgnoreCase(String name);
}
