package com.example.student_portal_backend.service;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.student_portal_backend.dto.request.GoogleRequest;
import com.example.student_portal_backend.dto.request.LoginRequest;
import com.example.student_portal_backend.dto.request.RegisterRequest;
import com.example.student_portal_backend.dto.response.AuthResponse;
import com.example.student_portal_backend.entity.UserEntity;
import com.example.student_portal_backend.repository.UserRepo;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        UserEntity entity = new UserEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setRole("TEACHER".equalsIgnoreCase(request.getRole()) ? "TEACHER" : "STUDENT");
        userRepo.save(entity);
        return new AuthResponse(null, "User registered successfully", entity.getRole());
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
