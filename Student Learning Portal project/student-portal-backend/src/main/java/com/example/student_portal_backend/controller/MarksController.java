package com.example.student_portal_backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.student_portal_backend.dto.request.MarksRequest;
import com.example.student_portal_backend.dto.response.MarksResponse;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.UserRepo;
import com.example.student_portal_backend.service.MarksService;

@RestController
@RequestMapping("/marks")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class MarksController {

    private final MarksService marksService;
    private final UserRepo userRepo;

    public MarksController(MarksService marksService, UserRepo userRepo) {
        this.marksService = marksService;
        this.userRepo = userRepo;
    }

    // Teacher adds marks
    @PostMapping
    public MarksResponse addMarks(@RequestBody MarksRequest req, Authentication auth) {
        return marksService.addMarks(req, auth.getName());
    }

    // Teacher updates existing marks
    @PutMapping("/{id}")
    public MarksResponse updateMarks(@PathVariable Long id,
            @RequestBody MarksRequest req, Authentication auth) {
        return marksService.updateMarks(id, req);
    }

    // Teacher views marks they entered
    @GetMapping("/teacher")
    public List<MarksResponse> teacherMarks(Authentication auth) {
        UserEntity teacher = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return marksService.getByTeacher(teacher.getId());
    }

    // Student views their own marks
    @GetMapping("/my")
    public List<MarksResponse> myMarks(Authentication auth) {
        UserEntity student = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return marksService.getByStudent(student.getId());
    }

    // Admin views all marks
    @GetMapping
    public List<MarksResponse> allMarks() {
        return marksService.getAll();
    }

    // View marks for a specific student (teacher/admin use)
    @GetMapping("/student/{studentId}")
    public List<MarksResponse> byStudent(@PathVariable Long studentId) {
        return marksService.getByStudent(studentId);
    }
}
