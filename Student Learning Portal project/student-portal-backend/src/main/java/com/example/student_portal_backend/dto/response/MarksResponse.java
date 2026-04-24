package com.example.student_portal_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarksResponse {
    private Long id;
    private String studentName;
    private String studentEmail;
    private String teacherName;
    private String subjectName;
    private String subjectCode;
    private String courseName;
    private String examType;
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
    private LocalDateTime recordedAt;
}
