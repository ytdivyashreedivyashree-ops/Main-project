package com.example.student_portal_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.AssignmentEntity;

public interface AssignmentRepo extends JpaRepository<AssignmentEntity, Long> {

    List<AssignmentEntity> findByDueDateAfterOrderByDueDateAsc(LocalDateTime now);
    List<AssignmentEntity> findByDueDateBeforeOrderByDueDateAsc(LocalDateTime now);

    List<AssignmentEntity> findByCreatedBy(String createdBy);
    List<AssignmentEntity> findByCourseId(Long courseId);
    List<AssignmentEntity> findByCreatedByAndDueDateAfterOrderByDueDateAsc(String createdBy, LocalDateTime now);
    List<AssignmentEntity> findByCreatedByAndDueDateBeforeOrderByDueDateAsc(String createdBy, LocalDateTime now);
    List<AssignmentEntity> findByCourseIdAndDueDateAfterOrderByDueDateAsc(Long courseId, LocalDateTime now);
    List<AssignmentEntity> findByCourseIdAndDueDateBeforeOrderByDueDateAsc(Long courseId, LocalDateTime now);
    List<AssignmentEntity> findBySubjectId(Long subjectId);
    List<AssignmentEntity> findByCourseIdAndSubjectId(Long courseId, Long subjectId);
}
