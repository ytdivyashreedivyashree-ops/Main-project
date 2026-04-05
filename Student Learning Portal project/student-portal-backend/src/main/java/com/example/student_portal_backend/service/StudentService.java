package com.example.student_portal_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.student_portal_backend.dto.request.StudentRequest;
import com.example.student_portal_backend.dto.response.StudentResponse;
import com.example.student_portal_backend.entity.StudentEntity;
import com.example.student_portal_backend.repository.StudentRepo;

@Service
public class StudentService {
    private final StudentRepo studentRepo;

    public StudentService(StudentRepo studentRepo) {
        this.studentRepo = studentRepo;
    }

    // add students
    public StudentResponse addStudent(StudentRequest request) {
        StudentEntity entity = new StudentEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setCourse(request.getCourse());
        entity.setPhone(request.getPhone());

        StudentEntity savedStudent = studentRepo.save(entity);

        StudentResponse response = new StudentResponse();
        response.setId(savedStudent.getId());
        response.setName(savedStudent.getName());
        response.setEmail(savedStudent.getEmail());
        response.setCourse(savedStudent.getCourse());
        response.setPhone(savedStudent.getPhone());

        return response;
    }

    // get all students
    public List<StudentResponse> getAllStudents() {
        return studentRepo.findAll()
                .stream()
                .map(student -> {
                    StudentResponse response = new StudentResponse();
                    response.setId(student.getId());
                    response.setName(student.getName());
                    response.setEmail(student.getEmail());
                    response.setCourse(student.getCourse());
                    response.setPhone(student.getPhone());
                    return response;
                })
                .toList();
    }

    public StudentResponse getStudentById(@NonNull Long id) {
        Optional<StudentEntity> optional = studentRepo.findById(id);
        StudentEntity student = optional.orElseThrow(() -> new RuntimeException("Student not found"));

        StudentResponse res = new StudentResponse();
        res.setId(student.getId());
        res.setName(student.getName());
        res.setEmail(student.getEmail());
        res.setCourse(student.getCourse());
        res.setPhone(student.getPhone());

        return res;
    }

    public StudentResponse updateStudent(@NonNull Long id, StudentRequest request) {
        Optional<StudentEntity> optional = studentRepo.findById(id);
        StudentEntity student = optional.orElseThrow(() -> new RuntimeException("Student not found"));
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setCourse(request.getCourse());
        student.setPhone(request.getPhone());

        StudentEntity updatedStudent = studentRepo.save(student);

        StudentResponse response = new StudentResponse();
        response.setId(updatedStudent.getId());
        response.setName(updatedStudent.getName());
        response.setEmail(updatedStudent.getEmail());
        response.setCourse(updatedStudent.getCourse());
        response.setPhone(updatedStudent.getPhone());

        return response;
    }

    public String deleteStudent(@NonNull Long id) {
        if (!studentRepo.existsById(id)) {
            throw new RuntimeException("Student not found");
        }
        studentRepo.deleteById(id);
        return "Student deleted successfully";
    }
}
