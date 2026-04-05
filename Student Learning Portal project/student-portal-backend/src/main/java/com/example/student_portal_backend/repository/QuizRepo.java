package com.example.student_portal_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.example.student_portal_backend.entity.QuizEntity;

public interface QuizRepo extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findByAssignmentId(Long assignmentId);
    Optional<QuizEntity> findByAssignmentIdAndId(Long assignmentId, Long quizId);

    @Transactional
    void deleteAllByAssignmentId(Long assignmentId);
}
