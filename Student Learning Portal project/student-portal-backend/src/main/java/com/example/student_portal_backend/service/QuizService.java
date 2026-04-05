package com.example.student_portal_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.student_portal_backend.dto.request.QuizRequest;
import com.example.student_portal_backend.dto.request.QuizSubmitRequest;
import com.example.student_portal_backend.dto.response.QuizQuestionResponse;
import com.example.student_portal_backend.dto.response.QuizResponse;
import com.example.student_portal_backend.dto.response.QuizResultResponse;
import com.example.student_portal_backend.entity.AssignmentEntity;
import com.example.student_portal_backend.entity.QuizEntity;
import com.example.student_portal_backend.entity.QuizQuestionEntity;
import com.example.student_portal_backend.entity.QuizResultEntity;
import com.example.student_portal_backend.repository.AssignmentRepo;
import com.example.student_portal_backend.repository.QuizRepo;
import com.example.student_portal_backend.repository.QuizResultRepo;

@Service
public class QuizService {

    private final QuizRepo quizRepo;
    private final QuizResultRepo quizResultRepo;
    private final AssignmentRepo assignmentRepo;

    public QuizService(QuizRepo quizRepo, QuizResultRepo quizResultRepo, AssignmentRepo assignmentRepo) {
        this.quizRepo = quizRepo;
        this.quizResultRepo = quizResultRepo;
        this.assignmentRepo = assignmentRepo;
    }

    private QuizResponse toResponse(QuizEntity q) {
        List<QuizQuestionResponse> questions = q.getQuestions().stream()
                .map(qq -> new QuizQuestionResponse(qq.getId(), qq.getQuestion(),
                        qq.getOptionA(), qq.getOptionB(), qq.getOptionC(), qq.getOptionD()))
                .toList();
        return new QuizResponse(q.getId(), q.getTitle(),
                q.getAssignment().getId(), q.getAssignment().getTopic(), questions);
    }

    private QuizResultResponse toResultResponse(QuizResultEntity r) {
        return new QuizResultResponse(r.getId(), r.getQuiz().getId(),
                r.getQuiz().getTitle(), r.getStudentEmail(),
                r.getScore(), r.getTotal(), r.getSubmittedAt());
    }

    public QuizResponse createQuiz(QuizRequest request) {
        Long assignmentId = request.getAssignmentId();
        if (assignmentId == null)
            throw new RuntimeException("Assignment ID is required");

        AssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        QuizEntity quiz = new QuizEntity();
        quiz.setTitle(request.getTitle());
        quiz.setAssignment(assignment);

        List<QuizQuestionEntity> questions = request.getQuestions().stream().map(q -> {
            QuizQuestionEntity entity = new QuizQuestionEntity();
            entity.setQuiz(quiz);
            entity.setQuestion(q.getQuestion());
            entity.setOptionA(q.getOptionA());
            entity.setOptionB(q.getOptionB());
            entity.setOptionC(q.getOptionC());
            entity.setOptionD(q.getOptionD());
            entity.setCorrectOption(q.getCorrectOption().toUpperCase());
            return entity;
        }).toList();

        quiz.setQuestions(questions);
        return toResponse(quizRepo.save(quiz));
    }

    public List<QuizResponse> getQuizzesByAssignment(Long assignmentId) {
        if (assignmentId == null)
            throw new RuntimeException("Assignment ID is required");
        return quizRepo.findByAssignmentId(assignmentId).stream().map(this::toResponse).toList();
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepo.findAll().stream().map(this::toResponse).toList();
    }

    public QuizResultResponse submitQuiz(QuizSubmitRequest request, String studentEmail) {
        Long quizId = request.getQuizId();
        if (quizId == null)
            throw new RuntimeException("Quiz ID is required");

        QuizEntity quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quizResultRepo.findByQuizIdAndStudentEmail(quizId, studentEmail).isPresent()) {
            throw new RuntimeException("Already attempted this quiz");
        }

        int score = 0;
        for (QuizQuestionEntity q : quiz.getQuestions()) {
            String chosen = request.getAnswers().get(q.getId());
            if (q.getCorrectOption().equalsIgnoreCase(chosen)) {
                score++;
            }
        }

        QuizResultEntity result = new QuizResultEntity();
        result.setQuiz(quiz);
        result.setStudentEmail(studentEmail);
        result.setScore(score);
        result.setTotal(quiz.getQuestions().size());
        result.setSubmittedAt(LocalDateTime.now());

        return toResultResponse(quizResultRepo.save(result));
    }

    public List<QuizResultResponse> getMyResults(String studentEmail) {
        return quizResultRepo.findByStudentEmail(studentEmail).stream()
                .map(this::toResultResponse).toList();
    }

    public List<QuizResultResponse> getResultsByQuiz(Long quizId) {
        if (quizId == null)
            throw new RuntimeException("Quiz ID is required");
        return quizResultRepo.findByQuizId(quizId).stream()
                .map(this::toResultResponse).toList();
    }

    public boolean hasAttempted(Long quizId, String studentEmail) {
        if (quizId == null)
            return false;
        return quizResultRepo.findByQuizIdAndStudentEmail(quizId, studentEmail).isPresent();
    }

    public void deleteQuiz(Long id) {
        if (id != null) {
            quizRepo.deleteById(id);
        }
    }
}
