import axios from "axios";

const BASE = "http://localhost:8080/marks";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export const addMarks = (data) => axios.post(BASE, data, { headers: headers() });
export const updateMarks = (id, data) => axios.put(`${BASE}/${id}`, data, { headers: headers() });
export const getMyMarks = () => axios.get(`${BASE}/my`, { headers: headers() });
export const getTeacherMarks = () => axios.get(`${BASE}/teacher`, { headers: headers() });
export const getAllMarks = () => axios.get(BASE, { headers: headers() });
export const getMarksByStudent = (studentId) => axios.get(`${BASE}/student/${studentId}`, { headers: headers() });
