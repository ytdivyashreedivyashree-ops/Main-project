package com.example.student_portal_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.response.StudyMaterialResponse;
import com.example.student_portal_backend.entity.StudyMaterialEntity;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.StudyMaterialRepo;
import com.example.student_portal_backend.repository.TeacherSubjectRepo;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepo studyMaterialRepo;
    private final UserRepo userRepo;
    private final TeacherSubjectRepo teacherSubjectRepo;

    public StudyMaterialService(StudyMaterialRepo studyMaterialRepo,
            UserRepo userRepo, TeacherSubjectRepo teacherSubjectRepo) {
        this.studyMaterialRepo = studyMaterialRepo;
        this.userRepo = userRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }

    private StudyMaterialResponse toResponse(StudyMaterialEntity m) {
        StudyMaterialResponse res = new StudyMaterialResponse();
        res.setId(m.getId());
        res.setTitle(m.getTitle());
        res.setFileName(m.getFileName());
        res.setFileType(m.getFileType());
        res.setFileUrl("http://localhost:8080/uploads/" + m.getFileName());
        res.setCourseName(m.getCourse() != null ? m.getCourse().getName() : null);
        res.setSubjectName(m.getSubject() != null ? m.getSubject().getSubjectName() : null);
        res.setSubjectId(m.getSubject() != null ? m.getSubject().getId() : null);
        res.setUploadedByName(m.getUploadedBy() != null ? m.getUploadedBy().getName() : null);
        res.setUploadedById(m.getUploadedBy() != null ? m.getUploadedBy().getId() : null);
        return res;
    }

    public StudyMaterialResponse uploadMaterial(String title, MultipartFile file,
            String uploaderEmail) throws IOException {

        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String fileName = System.currentTimeMillis() + "_" + originalName;
        Path filePath = Paths.get(uploadDir, fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        StudyMaterialEntity material = new StudyMaterialEntity();
        material.setTitle(title);
        material.setFileName(fileName);
        material.setFileType(file.getContentType());
        material.setFilePath(filePath.toString());

        if (uploaderEmail != null) {
            UserEntity uploader = userRepo.findByEmail(uploaderEmail).orElse(null);
            if (uploader != null) {
                material.setUploadedBy(uploader);

                // auto-resolve subject and course from teacher's first registered subject
                List<TeacherSubjectEntity> teacherSubjects = teacherSubjectRepo.findByTeacherId(uploader.getId());
                if (!teacherSubjects.isEmpty()) {
                    TeacherSubjectEntity ts = teacherSubjects.get(0);
                    material.setSubject(ts.getSubject());
                    material.setCourse(ts.getSubject().getCourse());
                }
            }
        }

        return toResponse(studyMaterialRepo.save(material));
    }

    public void deleteMaterial(@NonNull Long id) {
        studyMaterialRepo.deleteById(id);
    }

    public StudyMaterialResponse updateTitle(@NonNull Long id, String newTitle) {
        StudyMaterialEntity m = studyMaterialRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        m.setTitle(newTitle);
        return toResponse(studyMaterialRepo.save(m));
    }

    public List<StudyMaterialResponse> getAllMaterials() {
        return studyMaterialRepo.findAll().stream().map(this::toResponse).toList();
    }

    public List<StudyMaterialResponse> getMaterialsByCourse(Long courseId) {
        return studyMaterialRepo.findByCourseId(courseId).stream().map(this::toResponse).toList();
    }

    public List<StudyMaterialResponse> getMaterialsByUploader(Long userId) {
        return studyMaterialRepo.findByUploadedById(userId).stream().map(this::toResponse).toList();
    }

    public List<StudyMaterialResponse> getMaterialsBySubject(Long subjectId) {
        return studyMaterialRepo.findBySubjectId(subjectId).stream().map(this::toResponse).toList();
    }

    public List<StudyMaterialResponse> getMaterialsByCourseAndSubject(Long courseId, Long subjectId) {
        return studyMaterialRepo.findByCourseIdAndSubjectId(courseId, subjectId)
                .stream().map(this::toResponse).toList();
    }
}
