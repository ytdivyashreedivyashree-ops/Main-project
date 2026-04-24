package com.example.student_portal_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.student_portal_backend.dto.response.AssignmentResponse;
import com.example.student_portal_backend.entity.AssignmentEntity;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.AssignmentRepo;
import com.example.student_portal_backend.repository.QuizRepo;
import com.example.student_portal_backend.repository.SubmissionRepo;
import com.example.student_portal_backend.repository.TeacherSubjectRepo;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class AssignmentService {

    private final AssignmentRepo assignmentRepo;
    private final SubmissionRepo submissionRepo;
    private final QuizRepo quizRepo;
    private final UserRepo userRepo;
    private final TeacherSubjectRepo teacherSubjectRepo;

    public AssignmentService(AssignmentRepo assignmentRepo, SubmissionRepo submissionRepo,
            QuizRepo quizRepo, UserRepo userRepo, TeacherSubjectRepo teacherSubjectRepo) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.quizRepo = quizRepo;
        this.userRepo = userRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }

    private AssignmentResponse mapToResponse(AssignmentEntity a) {
        AssignmentResponse res = new AssignmentResponse();
        res.setId(a.getId());
        res.setTopic(a.getTopic());
        res.setDescription(a.getDescription());
        res.setDueDate(a.getDueDate());
        res.setTitle(a.getTitle());
        res.setCourseName(a.getCourse() != null ? a.getCourse().getName() : null);
        res.setSubjectName(a.getSubject() != null ? a.getSubject().getSubjectName() : null);
        res.setGivenByName(a.getCreatedBy());
        return res;
    }

    public AssignmentResponse createAssignment(String topic, String description,
            String dueDate, String teacherEmail, String title) {

        LocalDate parsedDate;
        if (dueDate.matches("\\d{2}-\\d{2}-\\d{4}")) {
            parsedDate = LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        } else {
            parsedDate = LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        LocalDateTime parsedDueDate = parsedDate.atTime(23, 59);

        AssignmentEntity assignment = new AssignmentEntity();
        assignment.setTopic(topic);
        assignment.setTitle(title != null ? title : topic);
        assignment.setDescription(description);
        assignment.setDueDate(parsedDueDate);
        assignment.setCreatedAt(LocalDateTime.now());

        if (teacherEmail != null) {
            UserEntity teacher = userRepo.findByEmail(teacherEmail).orElse(null);
            if (teacher != null) {
                assignment.setCreatedBy(teacher.getName());
                List<TeacherSubjectEntity> teacherSubjects =
                        teacherSubjectRepo.findByTeacherId(teacher.getId());
                if (!teacherSubjects.isEmpty()) {
                    TeacherSubjectEntity ts = teacherSubjects.get(0);
                    assignment.setSubject(ts.getSubject());
                    assignment.setCourse(ts.getSubject().getCourse());
                }
            }
        }

        return mapToResponse(assignmentRepo.save(assignment));
    }

    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepo.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getByTeacher(String teacherName) {
        return assignmentRepo.findByCreatedBy(teacherName).stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getByCourse(Long courseId) {
        return assignmentRepo.findByCourseId(courseId).stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getUpcomingAssignments() {
        return assignmentRepo.findByDueDateAfterOrderByDueDateAsc(LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getOverdueAssignments() {
        return assignmentRepo.findByDueDateBeforeOrderByDueDateAsc(LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getUpcomingByTeacher(String teacherName) {
        return assignmentRepo.findByCreatedByAndDueDateAfterOrderByDueDateAsc(teacherName, LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getOverdueByTeacher(String teacherName) {
        return assignmentRepo.findByCreatedByAndDueDateBeforeOrderByDueDateAsc(teacherName, LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getUpcomingByCourse(Long courseId) {
        return assignmentRepo.findByCourseIdAndDueDateAfterOrderByDueDateAsc(courseId, LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getOverdueByCourse(Long courseId) {
        return assignmentRepo.findByCourseIdAndDueDateBeforeOrderByDueDateAsc(courseId, LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getBySubject(Long subjectId) {
        return assignmentRepo.findBySubjectId(subjectId).stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getByCourseAndSubject(Long courseId, Long subjectId) {
        return assignmentRepo.findByCourseIdAndSubjectId(courseId, subjectId)
                .stream().map(this::mapToResponse).toList();
    }

    public AssignmentResponse updateAssignment(Long id, String topic, String description, String dueDate) {
        AssignmentEntity assignment = assignmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (topic != null) { assignment.setTopic(topic); assignment.setTitle(topic); }
        if (description != null) assignment.setDescription(description);
        if (dueDate != null) {
            LocalDate parsedDate = dueDate.matches("\\d{2}-\\d{2}-\\d{4}")
                    ? LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"))
                    : LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            assignment.setDueDate(parsedDate.atTime(23, 59));
        }
        return mapToResponse(assignmentRepo.save(assignment));
    }

    public void deleteAssignment(Long id) {
        if (id == null) return;
        submissionRepo.deleteAllByAssignmentId(id);
        quizRepo.deleteAllByAssignmentId(id);
        assignmentRepo.deleteById(id);
    }
}
