import axios from "axios";

const BASE = "http://localhost:8080";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// existing exports — unchanged
export const createAssignment = (formData) =>
  axios.post(`${BASE}/assignments`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const getAllAssignments = () => axios.get(`${BASE}/assignments`, authHeader());
export const getUpcomingAssignments = () => axios.get(`${BASE}/assignments/upcoming`, authHeader());
export const getOverdueAssignments = () => axios.get(`${BASE}/assignments/overdue`, authHeader());
export const deleteAssignment = (id) => axios.delete(`${BASE}/assignments/${id}`, authHeader());

export const updateAssignment = (id, formData) =>
  axios.put(`${BASE}/assignments/${id}`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const submitAssignment = (formData) =>
  axios.post(`${BASE}/submissions`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const checkSubmitted = (assignmentId) =>
  axios.get(`${BASE}/submissions/check/${assignmentId}`, authHeader());

// new exports
export const getMyAssignments = () => axios.get(`${BASE}/assignments/my`, authHeader());
export const getMyUpcomingAssignments = () => axios.get(`${BASE}/assignments/my/upcoming`, authHeader());
export const getMyOverdueAssignments = () => axios.get(`${BASE}/assignments/my/overdue`, authHeader());
export const getAssignmentsBySubject = (subjectId) => axios.get(`${BASE}/assignments/subject/${subjectId}`, authHeader());
export const getAssignmentsByCourseAndSubject = (courseId, subjectId) =>
  axios.get(`${BASE}/assignments/course/${courseId}/subject/${subjectId}`, authHeader());
export const getTeacherSubmissions = () => axios.get(`${BASE}/submissions/teacher`, authHeader());
export const getMySubmissions = () => axios.get(`${BASE}/submissions/my`, authHeader());
