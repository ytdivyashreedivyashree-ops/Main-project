package com.example.student_portal_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.student_portal_backend.entity.QuizResultEntity;

public interface QuizResultRepo extends JpaRepository<QuizResultEntity, Long> {
    Optional<QuizResultEntity> findByQuizIdAndStudentEmail(Long quizId, String studentEmail);
    List<QuizResultEntity> findByStudentEmail(String studentEmail);
    List<QuizResultEntity> findByQuizId(Long quizId);
}
