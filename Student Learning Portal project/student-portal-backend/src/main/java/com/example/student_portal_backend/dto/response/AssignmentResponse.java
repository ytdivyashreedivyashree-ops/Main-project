package com.example.student_portal_backend.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    // existing fields
    private Long id;
    private String topic;
    private String description;
    private LocalDateTime dueDate;
    private String title;
    private String courseName;
    private String subjectName;
    private String givenByName;
}
