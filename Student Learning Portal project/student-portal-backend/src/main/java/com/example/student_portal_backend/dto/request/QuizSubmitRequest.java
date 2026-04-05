package com.example.student_portal_backend.dto.request;

import java.util.Map;

import lombok.Data;

@Data
public class QuizSubmitRequest {
    private Long quizId;
    private Map<Long, String> answers; // questionId -> chosen option ("A","B","C","D")
}
