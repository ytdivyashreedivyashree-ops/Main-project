package com.example.student_portal_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.student_portal_backend.dto.request.ProfileUpdateRequest;
import com.example.student_portal_backend.dto.response.UserResponse;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.entity.StudentEntity;
import com.example.student_portal_backend.repository.StudentRepo;
import com.example.student_portal_backend.repository.UserRepo;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class UserController {

    private final UserRepo userRepo;
    private final StudentRepo studentRepo;

    public UserController(UserRepo userRepo, StudentRepo studentRepo) {
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
    }

    private UserResponse toResponse(UserEntity u) {
        String picUrl = u.getProfilePic() != null
                ? "http://localhost:8080/uploads/profiles/" + u.getProfilePic()
                : null;
        return new UserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getCourse() != null ? u.getCourse().getId() : null,
                u.getCourse() != null ? u.getCourse().getName() : null,
                u.getPhone(), u.getBio(), picUrl);
    }

    // Get current logged-in user info
    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        UserEntity u = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(u);
    }

    // Update profile (name, phone, bio)
    @PutMapping("/me")
    public UserResponse updateProfile(@RequestBody ProfileUpdateRequest req, Authentication auth) {
        UserEntity u = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (req.getName() != null && !req.getName().isBlank())
            u.setName(req.getName());
        if (req.getPhone() != null)
            u.setPhone(req.getPhone());
        if (req.getBio() != null)
            u.setBio(req.getBio());
        return toResponse(userRepo.save(u));
    }

    // Upload profile picture
    @PostMapping(value = "/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse uploadPicture(@RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        UserEntity u = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String uploadDir = "uploads/profiles/";
        Files.createDirectories(Paths.get(uploadDir));
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "profile";
        // sanitize: strip any path separators to prevent path traversal
        String safeName = Paths.get(originalName).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = u.getId() + "_" + safeName;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = uploadPath.resolve(fileName).normalize();
        // ensure resolved path stays inside upload directory
        if (!filePath.startsWith(uploadPath)) {
            throw new IOException("Invalid file name");
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        u.setProfilePic(fileName);
        return toResponse(userRepo.save(u));
    }

    // Remove profile picture
    @DeleteMapping("/me/picture")
    public UserResponse removePicture(Authentication auth) {
        UserEntity u = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        u.setProfilePic(null);
        return toResponse(userRepo.save(u));
    }

    // Teacher: students from same course (registered + manually added)
    @GetMapping("/students/my-course")
    public List<UserResponse> studentsInMyCourse(Authentication auth) {
        UserEntity teacher = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (teacher.getCourse() == null)
            return List.of();

        String courseName = teacher.getCourse().getName();
        Long courseId = teacher.getCourse().getId();

        // registered students from users table
        List<UserResponse> registered = userRepo.findByRoleAndCourseId("STUDENT", courseId)
                .stream().map(this::toResponse).toList();

        // manually added students from students table matching course name
        List<UserResponse> manual = studentRepo.findByCourseIgnoreCase(courseName).stream()
                .map(s -> new UserResponse(s.getId(), s.getName(), s.getEmail(), "STUDENT",
                        courseId, courseName, s.getPhone(), null, null))
                .toList();

        // merge, avoiding duplicates by email
        java.util.Set<String> seenEmails = new java.util.HashSet<>();
        java.util.List<UserResponse> merged = new java.util.ArrayList<>(registered);
        registered.forEach(r -> seenEmails.add(r.getEmail()));
        manual.stream().filter(m -> seenEmails.add(m.getEmail())).forEach(merged::add);
        return merged;
    }

    // Admin: all students
    @GetMapping("/students")
    public List<UserResponse> allStudents() {
        return userRepo.findByRole("STUDENT").stream().map(this::toResponse).toList();
    }

    // Admin: all teachers
    @GetMapping("/teachers")
    public List<UserResponse> allTeachers() {
        return userRepo.findByRole("TEACHER").stream().map(this::toResponse).toList();
    }
}
