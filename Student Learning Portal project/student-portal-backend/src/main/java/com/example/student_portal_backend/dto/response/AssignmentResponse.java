package com.example.student_portal_backend.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String topic;
    private String description;
    private LocalDateTime dueDate;
    private String fileName;
    private String fileUrl;
}
