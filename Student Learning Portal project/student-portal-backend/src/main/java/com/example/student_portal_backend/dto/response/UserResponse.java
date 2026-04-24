package com.example.student_portal_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Long courseId;
    private String courseName;
    private String phone;
    private String bio;
    private String profilePicUrl;
}
