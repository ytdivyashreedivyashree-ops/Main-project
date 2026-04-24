package com.example.student_portal_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;              // ADMIN, TEACHER, STUDENT
    private Long courseId;            // required for TEACHER and STUDENT
    private Long subjectId;           // teacher picks a predefined subject
    private String customSubjectName; // teacher picks "Other" and types a name
}
