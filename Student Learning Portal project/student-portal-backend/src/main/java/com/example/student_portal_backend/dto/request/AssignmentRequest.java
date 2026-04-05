package com.example.student_portal_backend.dto.request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {
    private String topic;
    private String description;
    private LocalDateTime dueDate;
}
