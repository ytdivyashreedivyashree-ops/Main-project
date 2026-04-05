package com.example.student_portal_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.SubmissionResponse;
import com.example.student_portal_backend.entity.AssignmentEntity;
import com.example.student_portal_backend.entity.SubmissionEntity;
import com.example.student_portal_backend.repository.AssignmentRepo;
import com.example.student_portal_backend.repository.SubmissionRepo;

@Service
public class SubmissionService {

    private final SubmissionRepo submissionRepo;
    private final AssignmentRepo assignmentRepo;
    private static final String UPLOAD_DIR = "uploads/submissions/";

    public SubmissionService(SubmissionRepo submissionRepo, AssignmentRepo assignmentRepo) {
        this.submissionRepo = submissionRepo;
        this.assignmentRepo = assignmentRepo;
    }

    private SubmissionResponse toResponse(SubmissionEntity e) {
        String fileUrl = (e.getSubmissionFileName() != null)
                ? "http://localhost:8080/uploads/submissions/" + e.getSubmissionFileName()
                : null;
        return new SubmissionResponse(
                e.getId(), e.getAssignment().getId(), e.getAssignment().getTopic(),
                e.getStudentEmail(), e.getStudentName(), e.getAnswer(),
                e.getSubmittedAt(), e.isLate(), fileUrl);
    }

    public SubmissionResponse submit(Long assignmentId, String answer,
            MultipartFile file, String studentEmail, String studentName) throws IOException {

        if (assignmentId == null) {
            throw new RuntimeException("Assignment ID cannot be null");
        }

        AssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        submissionRepo.findByAssignmentIdAndStudentEmail(assignmentId, studentEmail)
                .ifPresent(s -> {
                    throw new RuntimeException("Already submitted");
                });

        LocalDateTime now = LocalDateTime.now();
        SubmissionEntity entity = new SubmissionEntity();
        entity.setAssignment(assignment);
        entity.setStudentEmail(studentEmail);
        entity.setStudentName(studentName);
        entity.setAnswer(answer != null ? answer : "");
        entity.setSubmittedAt(now);
        entity.setLate(now.isAfter(assignment.getDueDate()));

        if (file != null && !file.isEmpty()) {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            entity.setSubmissionFileName(fileName);
            entity.setSubmissionFilePath(filePath.toString());
        }

        return toResponse(submissionRepo.save(entity));
    }

    public List<SubmissionResponse> getByAssignment(Long assignmentId) {
        return submissionRepo.findByAssignmentId(assignmentId)
                .stream().map(this::toResponse).toList();
    }

    public List<SubmissionResponse> getByStudent(String email) {
        return submissionRepo.findByStudentEmail(email)
                .stream().map(this::toResponse).toList();
    }

    public boolean hasSubmitted(Long assignmentId, String email) {
        return submissionRepo.findByAssignmentIdAndStudentEmail(assignmentId, email).isPresent();
    }
}
