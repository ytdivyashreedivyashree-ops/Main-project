package com.example.student_portal_backend.dto.request;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarksRequest {
    private Long studentId;
    private String examType;
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
}
