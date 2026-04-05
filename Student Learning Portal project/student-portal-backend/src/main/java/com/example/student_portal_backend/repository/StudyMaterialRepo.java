package com.example.student_portal_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.StudyMaterialEntity;

public interface StudyMaterialRepo extends JpaRepository<StudyMaterialEntity, Long> {
}