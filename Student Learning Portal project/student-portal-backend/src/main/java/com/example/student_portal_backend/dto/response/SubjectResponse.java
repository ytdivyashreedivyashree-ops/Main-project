package com.example.student_portal_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String subjectName;
    private String subjectCode;
    private Long courseId;
    private String courseName;
    private Long teacherId;
    private String teacherName;
}
