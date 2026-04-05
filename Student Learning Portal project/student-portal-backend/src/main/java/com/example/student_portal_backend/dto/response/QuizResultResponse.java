package com.example.student_portal_backend.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private String studentEmail;
    private int score;
    private int total;
    private LocalDateTime submittedAt;
}
