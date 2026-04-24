package com.example.student_portal_backend.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.student_portal_backend.entity.CourseEntity;
import com.example.student_portal_backend.repository.CourseRepo;

@Service
public class CourseService {

    private final CourseRepo courseRepo;

    public CourseService(CourseRepo courseRepo) {
        this.courseRepo = courseRepo;
    }

    public List<CourseEntity> getAllCourses() {
        return courseRepo.findAll();
    }

    public CourseEntity getById(@NonNull Long id) {
        return courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }
}
