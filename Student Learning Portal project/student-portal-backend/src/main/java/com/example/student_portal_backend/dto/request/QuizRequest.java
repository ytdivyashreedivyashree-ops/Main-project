package com.example.student_portal_backend.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class QuizRequest {
    private String title;
    private Long assignmentId;
    private List<QuizQuestionRequest> questions;
}
