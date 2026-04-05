package com.example.student_portal_backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.SubmissionResponse;
import com.example.student_portal_backend.service.SubmissionService;

@RestController
@RequestMapping("/submissions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SubmissionResponse submit(
            @RequestParam Long assignmentId,
            @RequestParam(required = false) String answer,
            @RequestParam(required = false) MultipartFile file,
            Authentication auth) throws IOException {

        String username = auth.getName();
        return submissionService.submit(assignmentId, answer, file, username, username);
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<SubmissionResponse> getByAssignment(@PathVariable Long assignmentId) {
        return submissionService.getByAssignment(assignmentId);
    }

    @GetMapping("/my")
    public List<SubmissionResponse> getMySubmissions(Authentication auth) {
        return submissionService.getByStudent(auth.getName());
    }

    @GetMapping("/check/{assignmentId}")
    public boolean hasSubmitted(@PathVariable Long assignmentId, Authentication auth) {
        return submissionService.hasSubmitted(assignmentId, auth.getName());
    }
}