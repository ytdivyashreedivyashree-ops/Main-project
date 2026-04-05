import axios from "axios";

const BASE_URL = "http://localhost:8080/students";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllStudents = () => axios.get(BASE_URL, getAuthHeader());

export const addStudent = (student) =>
  axios.post(BASE_URL, student, getAuthHeader());

export const deleteStudent = (id) =>
  axios.delete(`${BASE_URL}/${id}`, getAuthHeader());

export const getStudentById = (id) =>
  axios.get(`${BASE_URL}/${id}`, getAuthHeader());

export const updateStudent = (id, student) =>
  axios.put(`${BASE_URL}/${id}`, student, getAuthHeader());