package com.example.student_portal_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.AssignmentResponse;
import com.example.student_portal_backend.entity.AssignmentEntity;
import com.example.student_portal_backend.repository.AssignmentRepo;
import com.example.student_portal_backend.repository.QuizRepo;
import com.example.student_portal_backend.repository.SubmissionRepo;

@Service
public class AssignmentService {

    private final AssignmentRepo assignmentRepo;
    private final SubmissionRepo submissionRepo;
    private final QuizRepo quizRepo;
    private static final String UPLOAD_DIR = "uploads/assignments/";

    public AssignmentService(AssignmentRepo assignmentRepo, SubmissionRepo submissionRepo, QuizRepo quizRepo) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.quizRepo = quizRepo;
    }

    private AssignmentResponse mapToResponse(AssignmentEntity a) {
        String fileUrl = a.getFileName() != null
                ? "http://localhost:8080/uploads/assignments/" + a.getFileName()
                : null;
        return new AssignmentResponse(a.getId(), a.getTopic(), a.getDescription(),
                a.getDueDate(), a.getFileName(), fileUrl);
    }

    public AssignmentResponse createAssignment(String topic, String description,
            String dueDate, MultipartFile file) throws IOException {

        LocalDate parsedDate;
        if (dueDate.matches("\\d{2}-\\d{2}-\\d{4}")) {
            parsedDate = LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        } else {
            parsedDate = LocalDate.parse(dueDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        LocalDateTime parsedDueDate = parsedDate.atTime(23, 59);

        String savedFileName = null;
        String savedFilePath = null;

        if (file != null && !file.isEmpty()) {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            savedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, savedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            savedFilePath = filePath.toString();
        }

        AssignmentEntity assignment = new AssignmentEntity();
        assignment.setTopic(topic);
        assignment.setDescription(description);
        assignment.setDueDate(parsedDueDate);
        assignment.setFileName(savedFileName);
        assignment.setFilePath(savedFilePath);

        return mapToResponse(assignmentRepo.save(assignment));
    }

    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepo.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getUpcomingAssignments() {
        return assignmentRepo.findByDueDateAfterOrderByDueDateAsc(LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public List<AssignmentResponse> getOverdueAssignments() {
        return assignmentRepo.findByDueDateBeforeOrderByDueDateAsc(LocalDateTime.now())
                .stream().map(this::mapToResponse).toList();
    }

    public void deleteAssignment(Long id) {
        if (id == null) return;
        Long safeId = id;
        submissionRepo.deleteAllByAssignmentId(safeId);
        quizRepo.deleteAllByAssignmentId(safeId);
        assignmentRepo.deleteById(safeId);
    }
}
