package com.example.student_portal_backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.StudyMaterialResponse;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.UserRepo;
import com.example.student_portal_backend.service.StudyMaterialService;

@RestController
@RequestMapping("/materials")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;
    private final UserRepo userRepo;

    public StudyMaterialController(StudyMaterialService studyMaterialService, UserRepo userRepo) {
        this.studyMaterialService = studyMaterialService;
        this.userRepo = userRepo;
    }

    // Teacher uploads — subject/course auto-resolved from teacher's registration
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudyMaterialResponse uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        String uploaderEmail = auth != null ? auth.getName() : null;
        return studyMaterialService.uploadMaterial(title, file, uploaderEmail);
    }

    // Teacher: delete their material
    @DeleteMapping("/{id}")
    public String deleteMaterial(@PathVariable @NonNull Long id) {
        studyMaterialService.deleteMaterial(id);
        return "Deleted";
    }

    // Teacher: update material title
    @PatchMapping("/{id}/title")
    public StudyMaterialResponse updateTitle(
            @PathVariable @NonNull Long id,
            @RequestBody String title) {
        return studyMaterialService.updateTitle(id, title.trim().replace("\"", ""));
    }

    // Admin: all materials
    @GetMapping
    public List<StudyMaterialResponse> getAllMaterials() {
        return studyMaterialService.getAllMaterials();
    }

    // Teacher: only their own uploads
    @GetMapping("/my")
    public List<StudyMaterialResponse> myMaterials(Authentication auth) {
        UserEntity user = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return studyMaterialService.getMaterialsByUploader(user.getId());
    }

    // Student: all materials for their course
    @GetMapping("/course")
    public List<StudyMaterialResponse> courseMaterials(Authentication auth) {
        UserEntity user = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getCourse() == null)
            return List.of();
        return studyMaterialService.getMaterialsByCourse(user.getCourse().getId());
    }

    // Student: materials filtered by a specific subject
    @GetMapping("/subject/{subjectId}")
    public List<StudyMaterialResponse> bySubject(@PathVariable Long subjectId) {
        return studyMaterialService.getMaterialsBySubject(subjectId);
    }

    // Student: materials filtered by course + subject
    @GetMapping("/course/{courseId}/subject/{subjectId}")
    public List<StudyMaterialResponse> byCourseAndSubject(
            @PathVariable Long courseId, @PathVariable Long subjectId) {
        return studyMaterialService.getMaterialsByCourseAndSubject(courseId, subjectId);
    }
}
