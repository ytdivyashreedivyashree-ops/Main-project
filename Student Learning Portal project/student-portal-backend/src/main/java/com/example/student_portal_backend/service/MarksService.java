package com.example.student_portal_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.student_portal_backend.dto.request.MarksRequest;
import com.example.student_portal_backend.dto.response.MarksResponse;
import com.example.student_portal_backend.entity.MarksEntity;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.MarksRepo;
import com.example.student_portal_backend.repository.TeacherSubjectRepo;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class MarksService {

    private final MarksRepo marksRepo;
    private final UserRepo userRepo;
    private final TeacherSubjectRepo teacherSubjectRepo;

    public MarksService(MarksRepo marksRepo, UserRepo userRepo,
            TeacherSubjectRepo teacherSubjectRepo) {
        this.marksRepo = marksRepo;
        this.userRepo = userRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }

    private MarksResponse toResponse(MarksEntity e) {
        return new MarksResponse(
                e.getId(),
                e.getStudent().getName(),
                e.getStudent().getEmail(),
                e.getTeacher().getName(),
                e.getSubject() != null ? e.getSubject().getSubjectName() : null,
                e.getSubject() != null ? e.getSubject().getSubjectCode() : null,
                e.getCourse() != null ? e.getCourse().getName() : null,
                e.getExamType(), e.getMarksObtained(), e.getMaxMarks(),
                e.getRecordedAt());
    }

    public MarksResponse addMarks(MarksRequest req, String teacherEmail) {
        Long studentId = req.getStudentId();
        if (studentId == null) throw new RuntimeException("Student ID is required");

        UserEntity teacher = userRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        MarksEntity entity = new MarksEntity();
        entity.setStudent(userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found")));
        entity.setTeacher(teacher);
        entity.setExamType(req.getExamType());
        entity.setMarksObtained(req.getMarksObtained());
        entity.setMaxMarks(req.getMaxMarks());
        entity.setRecordedAt(LocalDateTime.now());

        // auto-resolve subject and course from teacher's registered subject
        List<TeacherSubjectEntity> teacherSubjects =
                teacherSubjectRepo.findByTeacherId(teacher.getId());
        if (!teacherSubjects.isEmpty()) {
            TeacherSubjectEntity ts = teacherSubjects.get(0);
            entity.setSubject(ts.getSubject());
            entity.setCourse(ts.getSubject().getCourse());
        }

        return toResponse(marksRepo.save(entity));
    }

    public MarksResponse updateMarks(Long id, MarksRequest req) {
        Long marksId = id;
        if (marksId == null) throw new RuntimeException("Marks ID is required");
        MarksEntity entity = marksRepo.findById(marksId)
                .orElseThrow(() -> new RuntimeException("Marks record not found"));
        if (req.getExamType() != null) entity.setExamType(req.getExamType());
        if (req.getMarksObtained() != null) entity.setMarksObtained(req.getMarksObtained());
        if (req.getMaxMarks() != null) entity.setMaxMarks(req.getMaxMarks());
        return toResponse(marksRepo.save(entity));
    }

    public List<MarksResponse> getByStudent(Long studentId) {
        return marksRepo.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getByTeacher(Long teacherId) {
        return marksRepo.findByTeacherId(teacherId).stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getAll() {
        return marksRepo.findAll().stream().map(this::toResponse).toList();
    }
}
