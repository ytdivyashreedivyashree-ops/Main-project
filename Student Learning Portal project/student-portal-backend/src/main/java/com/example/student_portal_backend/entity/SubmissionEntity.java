package com.example.student_portal_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private AssignmentEntity assignment;

    @Column(nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false, length = 3000)
    private String answer;

    // student uploaded file
    private String submissionFileName;
    private String submissionFilePath;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private boolean late;
}
