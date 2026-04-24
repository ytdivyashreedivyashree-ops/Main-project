package com.example.student_portal_backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.student_portal_backend.dto.response.AssignmentResponse;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.UserRepo;
import com.example.student_portal_backend.service.AssignmentService;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final UserRepo userRepo;

    public AssignmentController(AssignmentService assignmentService, UserRepo userRepo) {
        this.assignmentService = assignmentService;
        this.userRepo = userRepo;
    }

    @PostMapping
    public AssignmentResponse createAssignment(
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("dueDate") String dueDate,
            @RequestParam(value = "title", required = false) String title,
            Authentication auth) {
        String teacherEmail = auth != null ? auth.getName() : null;
        return assignmentService.createAssignment(topic, description, dueDate, teacherEmail, title);
    }

    // existing endpoints — unchanged
    @GetMapping
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    @GetMapping("/upcoming")
    public List<AssignmentResponse> getUpcomingAssignments() {
        return assignmentService.getUpcomingAssignments();
    }

    @GetMapping("/overdue")
    public List<AssignmentResponse> getOverdueAssignments() {
        return assignmentService.getOverdueAssignments();
    }

    @PutMapping("/{id}")
    public AssignmentResponse updateAssignment(
            @PathVariable Long id,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "dueDate", required = false) String dueDate) {
        return assignmentService.updateAssignment(id, topic, description, dueDate);
    }

    @DeleteMapping("/{id}")
    public String deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return "Assignment deleted successfully";
    }

    // new endpoints
    @GetMapping("/my")
    public List<AssignmentResponse> myAssignments(Authentication auth) {
        UserEntity teacher = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return assignmentService.getByTeacher(teacher.getName());
    }

    @GetMapping("/my/upcoming")
    public List<AssignmentResponse> myUpcoming(Authentication auth) {
        UserEntity teacher = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return assignmentService.getUpcomingByTeacher(teacher.getName());
    }

    @GetMapping("/my/overdue")
    public List<AssignmentResponse> myOverdue(Authentication auth) {
        UserEntity teacher = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return assignmentService.getOverdueByTeacher(teacher.getName());
    }

    @GetMapping("/course/{courseId}")
    public List<AssignmentResponse> byCourse(@PathVariable Long courseId) {
        return assignmentService.getByCourse(courseId);
    }

    @GetMapping("/subject/{subjectId}")
    public List<AssignmentResponse> bySubject(@PathVariable Long subjectId) {
        return assignmentService.getBySubject(subjectId);
    }

    @GetMapping("/course/{courseId}/subject/{subjectId}")
    public List<AssignmentResponse> byCourseAndSubject(
            @PathVariable Long courseId, @PathVariable Long subjectId) {
        return assignmentService.getByCourseAndSubject(courseId, subjectId);
    }
}
