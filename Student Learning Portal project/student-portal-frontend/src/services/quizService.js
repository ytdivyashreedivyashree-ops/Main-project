import axios from "axios";

const BASE = "http://localhost:8080/quiz";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const createQuiz = (data) =>
  axios.post(BASE, data, authHeader());

export const getMyQuizzes = () =>
  axios.get(`${BASE}/my`, authHeader());

export const getAllQuizzes = () =>
  axios.get(BASE, authHeader());

export const getQuizzesBySubject = (subjectId) =>
  axios.get(`${BASE}/subject/${subjectId}`, authHeader());

export const getQuizzesByAssignment = (assignmentId) =>
  axios.get(`${BASE}/assignment/${assignmentId}`, authHeader());

export const submitQuiz = (data) =>
  axios.post(`${BASE}/submit`, data, authHeader());

export const getMyResults = () =>
  axios.get(`${BASE}/my-results`, authHeader());

export const getQuizResults = (quizId) =>
  axios.get(`${BASE}/${quizId}/results`, authHeader());

export const hasAttempted = (quizId) =>
  axios.get(`${BASE}/${quizId}/attempted`, authHeader());

export const deleteQuiz = (id) =>
  axios.delete(`${BASE}/${id}`, authHeader());
