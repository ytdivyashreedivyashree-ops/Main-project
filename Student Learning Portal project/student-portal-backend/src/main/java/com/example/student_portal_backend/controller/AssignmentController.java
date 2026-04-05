package com.example.student_portal_backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.AssignmentResponse;
import com.example.student_portal_backend.service.AssignmentService;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AssignmentResponse createAssignment(
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("dueDate") String dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        return assignmentService.createAssignment(topic, description, dueDate, file);
    }

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

    @DeleteMapping("/{id}")
    public String deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return "Assignment deleted successfully";
    }
}
