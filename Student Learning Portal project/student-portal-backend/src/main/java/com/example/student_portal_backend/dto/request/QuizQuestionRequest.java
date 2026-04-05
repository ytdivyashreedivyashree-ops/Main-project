package com.example.student_portal_backend.dto.request;

import lombok.Data;

@Data
public class QuizQuestionRequest {
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
}
