package com.example.student_portal_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;

public interface TeacherSubjectRepo extends JpaRepository<TeacherSubjectEntity, Long> {

    List<TeacherSubjectEntity> findByTeacherId(Long teacherId);

    List<TeacherSubjectEntity> findBySubjectId(Long subjectId);

    Optional<TeacherSubjectEntity> findByTeacherIdAndSubjectId(Long teacherId, Long subjectId);

    void deleteByTeacherIdAndSubjectId(Long teacherId, Long subjectId);
}
