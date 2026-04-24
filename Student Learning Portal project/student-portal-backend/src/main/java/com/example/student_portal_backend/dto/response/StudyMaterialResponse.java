package com.example.student_portal_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyMaterialResponse {
    private Long id;
    private String title;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private String courseName;
    private String subjectName;
    private Long subjectId;
    private String uploadedByName;
    private Long uploadedById;
}
