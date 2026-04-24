import axios from "axios";

const BASE = "http://localhost:8080/users";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export const getMe = () => axios.get(`${BASE}/me`, { headers: headers() });

export const updateProfile = (data) =>
  axios.put(`${BASE}/me`, data, { headers: headers() });

export const uploadProfilePicture = (formData) =>
  axios.post(`${BASE}/me/picture`, formData, {
    headers: { Authorization: `Bearer ${token()}` },
  });

export const removeProfilePicture = () =>
  axios.delete(`${BASE}/me/picture`, { headers: headers() });

export const getStudentsInMyCourse = () => axios.get(`${BASE}/students/my-course`, { headers: headers() });
export const getAllStudents = () => axios.get(`${BASE}/students`, { headers: headers() });
export const getAllTeachers = () => axios.get(`${BASE}/teachers`, { headers: headers() });
