package com.example.student_portal_backend.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.student_portal_backend.dto.request.GoogleRequest;
import com.example.student_portal_backend.dto.request.LoginRequest;
import com.example.student_portal_backend.dto.request.RegisterRequest;
import com.example.student_portal_backend.dto.response.AuthResponse;
import com.example.student_portal_backend.entity.CourseEntity;
import com.example.student_portal_backend.entity.SubjectEntity;
import com.example.student_portal_backend.entity.TeacherSubjectEntity;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.CourseRepo;
import com.example.student_portal_backend.repository.SubjectRepo;
import com.example.student_portal_backend.repository.TeacherSubjectRepo;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CourseRepo courseRepo;
    private final SubjectRepo subjectRepo;
    private final TeacherSubjectRepo teacherSubjectRepo;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder,
            JwtService jwtService, CourseRepo courseRepo,
            SubjectRepo subjectRepo, TeacherSubjectRepo teacherSubjectRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.courseRepo = courseRepo;
        this.subjectRepo = subjectRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String role = "STUDENT";
        if ("TEACHER".equalsIgnoreCase(request.getRole())) role = "TEACHER";
        else if ("ADMIN".equalsIgnoreCase(request.getRole())) role = "ADMIN";

        UserEntity entity = new UserEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setRole(role);

        CourseEntity course = null;
        Long courseId = request.getCourseId();
        if (courseId != null && !"ADMIN".equals(role)) {
            course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            entity.setCourse(course);
        }

        UserEntity saved = userRepo.save(entity);

        // Teacher: register their subject
        if ("TEACHER".equals(role)) {
            SubjectEntity subject = null;

            Long subjectId = request.getSubjectId();
            String customName = request.getCustomSubjectName();

            if (subjectId != null) {
                // predefined subject selected from list
                subject = subjectRepo.findById(subjectId)
                        .orElseThrow(() -> new RuntimeException("Subject not found"));

            } else if (customName != null && !customName.isBlank()) {
                // "Other" option — create a new subject in DB
                if (course == null) {
                    throw new RuntimeException("Course is required to add a custom subject");
                }
                SubjectEntity newSubject = new SubjectEntity();
                newSubject.setSubjectName(customName.trim());
                // generate a unique code so the unique constraint is satisfied
                newSubject.setSubjectCode("CUSTOM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
                newSubject.setCourse(course);
                subject = subjectRepo.save(newSubject);
            }

            if (subject != null) {
                TeacherSubjectEntity ts = new TeacherSubjectEntity();
                ts.setTeacher(saved);
                ts.setSubject(subject);
                teacherSubjectRepo.save(ts);
            }
        }

        return new AuthResponse(null, "User registered successfully", role);
    }

    public AuthResponse login(LoginRequest req) {
        UserEntity user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Login successful", user.getRole());
    }

    @SuppressWarnings("unchecked")
    public AuthResponse googleLogin(GoogleRequest req) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.getGoogleToken();
        Map<String, Object> info = new RestTemplate().getForObject(url, Map.class);
        if (info == null || info.get("email") == null) {
            throw new RuntimeException("Invalid Google token");
        }
        String email = info.get("email").toString();
        String name = info.getOrDefault("name", email).toString();
        UserEntity user = userRepo.findByEmail(email).orElseGet(() -> {
            UserEntity newUser = new UserEntity();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + email));
            newUser.setRole("STUDENT");
            return userRepo.save(newUser);
        });
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Login successful", user.getRole());
    }
}
