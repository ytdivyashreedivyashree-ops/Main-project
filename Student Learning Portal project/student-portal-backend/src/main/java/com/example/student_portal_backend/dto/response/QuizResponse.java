package com.example.student_portal_backend.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private Long assignmentId;
    private String assignmentTopic;
    private List<QuizQuestionResponse> questions;
}
