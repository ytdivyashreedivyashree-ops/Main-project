package com.example.student_portal_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.student_portal_backend.entity.AssignmentEntity;

public interface AssignmentRepo extends JpaRepository<AssignmentEntity, Long> {

    List<AssignmentEntity> findByDueDateAfterOrderByDueDateAsc(LocalDateTime now);

    List<AssignmentEntity> findByDueDateBeforeOrderByDueDateAsc(LocalDateTime now);
}