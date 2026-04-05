package com.example.student_portal_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.example.student_portal_backend.entity.SubmissionEntity;

public interface SubmissionRepo extends JpaRepository<SubmissionEntity, Long> {
    List<SubmissionEntity> findByAssignmentId(Long assignmentId);
    List<SubmissionEntity> findByStudentEmail(String email);
    Optional<SubmissionEntity> findByAssignmentIdAndStudentEmail(Long assignmentId, String email);

    @Transactional
    void deleteAllByAssignmentId(Long assignmentId);
}
