package com.example.student_portal_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.StudyMaterialEntity;

public interface StudyMaterialRepo extends JpaRepository<StudyMaterialEntity, Long> {
    List<StudyMaterialEntity> findByCourseId(Long courseId);
    List<StudyMaterialEntity> findByUploadedById(Long userId);
    List<StudyMaterialEntity> findBySubjectId(Long subjectId);
    List<StudyMaterialEntity> findByCourseIdAndSubjectId(Long courseId, Long subjectId);
    List<StudyMaterialEntity> findByUploadedByIdAndSubjectId(Long uploadedById, Long subjectId);
}
