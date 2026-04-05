package com.example.student_portal_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.StudyMaterialResponse;
import com.example.student_portal_backend.entity.StudyMaterialEntity;
import com.example.student_portal_backend.repository.StudyMaterialRepo;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepo studyMaterialRepo;

    public StudyMaterialService(StudyMaterialRepo studyMaterialRepo) {
        this.studyMaterialRepo = studyMaterialRepo;
    }

    public StudyMaterialResponse uploadMaterial(String title, MultipartFile file) throws IOException {
        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        String fileName = file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        StudyMaterialEntity material = new StudyMaterialEntity();
        material.setTitle(title);
        material.setFileName(fileName);
        material.setFileType(file.getContentType());
        material.setFilePath(filePath.toString());

        StudyMaterialEntity savedMaterial = studyMaterialRepo.save(material);

        return new StudyMaterialResponse(
                savedMaterial.getId(),
                savedMaterial.getTitle(),
                savedMaterial.getFileName(),
                savedMaterial.getFileType(),
                "http://localhost:8080/uploads/" + savedMaterial.getFileName());
    }

    public List<StudyMaterialResponse> getAllMaterials() {
        List<StudyMaterialEntity> materials = studyMaterialRepo.findAll();
        List<StudyMaterialResponse> responseList = new ArrayList<>();

        for (StudyMaterialEntity material : materials) {
            StudyMaterialResponse response = new StudyMaterialResponse();
            response.setId(material.getId());
            response.setTitle(material.getTitle());
            response.setFileName(material.getFileName());
            response.setFileType(material.getFileType());
            response.setFileUrl("http://localhost:8080/uploads/" + material.getFileName());

            responseList.add(response);
        }

        return responseList;
    }
}