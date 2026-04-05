package com.example.student_portal_backend.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTopic;
    private String studentEmail;
    private String studentName;
    private String answer;
    private LocalDateTime submittedAt;
    private boolean late;
    private String submissionFileUrl;  // student uploaded file
}
