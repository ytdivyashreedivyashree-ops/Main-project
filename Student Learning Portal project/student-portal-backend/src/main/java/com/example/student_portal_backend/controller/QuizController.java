package com.example.student_portal_backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.student_portal_backend.dto.request.QuizRequest;
import com.example.student_portal_backend.dto.request.QuizSubmitRequest;
import com.example.student_portal_backend.dto.response.QuizResponse;
import com.example.student_portal_backend.dto.response.QuizResultResponse;
import com.example.student_portal_backend.service.QuizService;

@RestController
@RequestMapping("/quiz")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Teacher: create quiz for an assignment
    @PostMapping
    public QuizResponse createQuiz(@RequestBody QuizRequest request) {
        return quizService.createQuiz(request);
    }

    // Teacher: get only their own quizzes
    @GetMapping("/my")
    public List<QuizResponse> myQuizzes(Authentication auth) {
        return quizService.getQuizzesByTeacher(auth.getName());
    }

    // Get quizzes by subject (student use)
    @GetMapping("/subject/{subjectId}")
    public List<QuizResponse> getBySubject(@PathVariable Long subjectId) {
        return quizService.getQuizzesBySubject(subjectId);
    }

    // Get all quizzes
    @GetMapping
    public List<QuizResponse> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    // Get quizzes by assignment
    @GetMapping("/assignment/{assignmentId}")
    public List<QuizResponse> getByAssignment(@PathVariable Long assignmentId) {
        return quizService.getQuizzesByAssignment(assignmentId);
    }

    // Student: submit quiz answers
    @PostMapping("/submit")
    public QuizResultResponse submit(@RequestBody QuizSubmitRequest request, Authentication auth) {
        return quizService.submitQuiz(request, auth.getName());
    }

    // Student: get my results
    @GetMapping("/my-results")
    public List<QuizResultResponse> myResults(Authentication auth) {
        return quizService.getMyResults(auth.getName());
    }

    // Teacher: get all results for a quiz
    @GetMapping("/{quizId}/results")
    public List<QuizResultResponse> quizResults(@PathVariable Long quizId) {
        return quizService.getResultsByQuiz(quizId);
    }

    // Check if student already attempted
    @GetMapping("/{quizId}/attempted")
    public boolean hasAttempted(@PathVariable Long quizId, Authentication auth) {
        return quizService.hasAttempted(quizId, auth.getName());
    }

    // Teacher: delete quiz
    @DeleteMapping("/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return "Quiz deleted";
    }
}
