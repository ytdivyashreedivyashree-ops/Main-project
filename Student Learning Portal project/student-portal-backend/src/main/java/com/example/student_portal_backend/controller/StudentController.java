package com.example.student_portal_backend.controller;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.student_portal_backend.dto.request.StudentRequest;
import com.example.student_portal_backend.dto.response.StudentResponse;
import com.example.student_portal_backend.service.StudentService;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public StudentResponse addStudent(@RequestBody StudentRequest student) {
        return studentService.addStudent(student);
    }

    @GetMapping
    public List<StudentResponse> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public StudentResponse getStudentById(@PathVariable @NonNull Long id) {
        return studentService.getStudentById(id);
    }

    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable @NonNull Long id, @RequestBody StudentRequest req) {
        return studentService.updateStudent(id, req);
    }

    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable @NonNull Long id) {
        return studentService.deleteStudent(id);
    }
}
