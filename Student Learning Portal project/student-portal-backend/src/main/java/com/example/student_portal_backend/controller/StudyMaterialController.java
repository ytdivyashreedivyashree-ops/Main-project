package com.example.student_portal_backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.StudyMaterialResponse;
import com.example.student_portal_backend.service.StudyMaterialService;

@RestController
@RequestMapping("/materials")
@CrossOrigin(origins = "http://localhost:5174")
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    public StudyMaterialController(StudyMaterialService studyMaterialService) {
        this.studyMaterialService = studyMaterialService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudyMaterialResponse uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) throws IOException {
        return studyMaterialService.uploadMaterial(title, file);
    }

    @GetMapping
    public List<StudyMaterialResponse> getAllMaterials() {
        return studyMaterialService.getAllMaterials();
    }
}