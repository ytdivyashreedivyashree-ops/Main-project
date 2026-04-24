package com.example.student_portal_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.SubjectEntity;

public interface SubjectRepo extends JpaRepository<SubjectEntity, Long> {
    List<SubjectEntity> findByCourseId(Long courseId);
    Optional<SubjectEntity> findBySubjectCode(String subjectCode);
}
