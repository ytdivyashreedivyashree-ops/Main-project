package com.example.student_portal_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.student_portal_backend.dto.request.SubjectRequest;
import com.example.student_portal_backend.dto.response.SubjectResponse;
import com.example.student_portal_backend.entity.CourseEntity;
import com.example.student_portal_backend.entity.SubjectEntity;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.CourseRepo;
import com.example.student_portal_backend.repository.SubjectRepo;
import com.example.student_portal_backend.repository.TeacherSubjectRepo;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class SubjectService {

    private final SubjectRepo subjectRepo;
    private final CourseRepo courseRepo;
    private final TeacherSubjectRepo teacherSubjectRepo;
    private final UserRepo userRepo;

    public SubjectService(SubjectRepo subjectRepo, CourseRepo courseRepo,
            TeacherSubjectRepo teacherSubjectRepo, UserRepo userRepo) {
        this.subjectRepo = subjectRepo;
        this.courseRepo = courseRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.userRepo = userRepo;
    }

    // plain subject response — no teacher info
    private SubjectResponse toResponse(SubjectEntity e) {
        return new SubjectResponse(
                e.getId(), e.getSubjectName(), e.getSubjectCode(),
                e.getCourse().getId(), e.getCourse().getName(),
                null, null);
    }

    // subject response with teacher info attached
    private SubjectResponse toResponseWithTeacher(SubjectEntity e, UserEntity teacher) {
        return new SubjectResponse(
                e.getId(), e.getSubjectName(), e.getSubjectCode(),
                e.getCourse().getId(), e.getCourse().getName(),
                teacher.getId(), teacher.getName());
    }

    // Create a new subject (admin/teacher)
    public SubjectResponse create(SubjectRequest req) {
        Long courseId = req.getCourseId();
        if (courseId == null) throw new RuntimeException("Course ID is required");
        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        SubjectEntity entity = new SubjectEntity();
        entity.setSubjectName(req.getSubjectName());
        entity.setSubjectCode(req.getSubjectCode());
        entity.setCourse(course);
        return toResponse(subjectRepo.save(entity));
    }

    // Teacher registers a subject they teach
    public SubjectResponse registerForTeacher(Long subjectId, String teacherEmail) {
        if (subjectId == null) throw new RuntimeException("Subject ID is required");
        UserEntity teacher = userRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        SubjectEntity subject = subjectRepo.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // already registered — just return it
        if (teacherSubjectRepo.findByTeacherIdAndSubjectId(teacher.getId(), subjectId).isPresent()) {
            return toResponseWithTeacher(subject, teacher);
        }

        TeacherSubjectEntity ts = new TeacherSubjectEntity();
        ts.setTeacher(teacher);
        ts.setSubject(subject);
        teacherSubjectRepo.save(ts);
        return toResponseWithTeacher(subject, teacher);
    }

    // Teacher unregisters a subject
    @Transactional
    public void unregisterForTeacher(Long subjectId, String teacherEmail) {
        UserEntity teacher = userRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        teacherSubjectRepo.deleteByTeacherIdAndSubjectId(teacher.getId(), subjectId);
    }

    // Get all subjects a teacher has registered
    public List<SubjectResponse> getByTeacher(String teacherEmail) {
        UserEntity teacher = userRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return teacherSubjectRepo.findByTeacherId(teacher.getId())
                .stream()
                .map(ts -> toResponseWithTeacher(ts.getSubject(), teacher))
                .toList();
    }

    // Get all subjects by teacher ID (used by students to browse)
    public List<SubjectResponse> getByTeacherId(Long teacherId) {
        if (teacherId == null) throw new RuntimeException("Teacher ID is required");
        UserEntity teacher = userRepo.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return teacherSubjectRepo.findByTeacherId(teacherId)
                .stream()
                .map(ts -> toResponseWithTeacher(ts.getSubject(), teacher))
                .toList();
    }

    // Get subjects by course — includes teacher info for each
    public List<SubjectResponse> getByCourse(Long courseId) {
        return subjectRepo.findByCourseId(courseId).stream().map(this::toResponse).toList();
    }

    // Get subjects by course that have at least one teacher registered
    public List<SubjectResponse> getByCourseWithTeachers(Long courseId) {
        return teacherSubjectRepo.findAll().stream()
                .filter(ts -> ts.getSubject().getCourse().getId().equals(courseId))
                .map(ts -> toResponseWithTeacher(ts.getSubject(), ts.getTeacher()))
                .toList();
    }

    public List<SubjectResponse> getAll() {
        return subjectRepo.findAll().stream().map(this::toResponse).toList();
    }

    public void delete(Long id) {
        if (id == null) throw new RuntimeException("Subject ID is required");
        subjectRepo.deleteById(id);
    }
}
