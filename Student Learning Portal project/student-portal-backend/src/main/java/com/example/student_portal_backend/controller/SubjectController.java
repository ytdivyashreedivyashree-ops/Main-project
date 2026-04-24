package com.example.student_portal_backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.student_portal_backend.dto.request.SubjectRequest;
import com.example.student_portal_backend.dto.response.SubjectResponse;
import com.example.student_portal_backend.service.SubjectService;

@RestController
@RequestMapping("/subjects")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    // Admin/Teacher: create a new subject
    @PostMapping
    public SubjectResponse create(@RequestBody SubjectRequest req) {
        return subjectService.create(req);
    }

    // Admin: get all subjects
    @GetMapping
    public List<SubjectResponse> getAll() {
        return subjectService.getAll();
    }

    // Get all subjects for a course (plain list, no teacher info)
    @GetMapping("/course/{courseId}")
    public List<SubjectResponse> getByCourse(@PathVariable Long courseId) {
        return subjectService.getByCourse(courseId);
    }

    // Get subjects for a course that have teachers registered (student use)
    @GetMapping("/course/{courseId}/with-teachers")
    public List<SubjectResponse> getByCourseWithTeachers(@PathVariable Long courseId) {
        return subjectService.getByCourseWithTeachers(courseId);
    }

    // Teacher: register a subject they teach
    @PostMapping("/{subjectId}/register")
    public SubjectResponse register(@PathVariable Long subjectId, Authentication auth) {
        return subjectService.registerForTeacher(subjectId, auth.getName());
    }

    // Teacher: unregister a subject
    @DeleteMapping("/{subjectId}/register")
    public String unregister(@PathVariable Long subjectId, Authentication auth) {
        subjectService.unregisterForTeacher(subjectId, auth.getName());
        return "Unregistered successfully";
    }

    // Teacher: get their own registered subjects
    @GetMapping("/my")
    public List<SubjectResponse> mySubjects(Authentication auth) {
        return subjectService.getByTeacher(auth.getName());
    }

    // Get subjects registered by a specific teacher (student use)
    @GetMapping("/teacher/{teacherId}")
    public List<SubjectResponse> byTeacher(@PathVariable Long teacherId) {
        return subjectService.getByTeacherId(teacherId);
    }

    // Admin: delete a subject
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        subjectService.delete(id);
        return "Subject deleted";
    }
}
