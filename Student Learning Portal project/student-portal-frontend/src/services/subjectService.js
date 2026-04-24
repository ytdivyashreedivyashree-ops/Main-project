import axios from "axios";

const BASE = "http://localhost:8080/subjects";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export const getAllSubjects = () => axios.get(BASE, { headers: headers() });
export const getSubjectsByCourse = (courseId) => axios.get(`${BASE}/course/${courseId}`, { headers: headers() });
export const getSubjectsByCourseWithTeachers = (courseId) => axios.get(`${BASE}/course/${courseId}/with-teachers`, { headers: headers() });
export const getMySubjects = () => axios.get(`${BASE}/my`, { headers: headers() });
export const getSubjectsByTeacher = (teacherId) => axios.get(`${BASE}/teacher/${teacherId}`, { headers: headers() });
export const registerSubject = (subjectId) => axios.post(`${BASE}/${subjectId}/register`, {}, { headers: headers() });
export const unregisterSubject = (subjectId) => axios.delete(`${BASE}/${subjectId}/register`, { headers: headers() });
export const createSubject = (data) => axios.post(BASE, data, { headers: headers() });
export const deleteSubject = (id) => axios.delete(`${BASE}/${id}`, { headers: headers() });
