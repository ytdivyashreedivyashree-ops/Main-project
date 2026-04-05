import axios from "axios";

const BASE = "http://localhost:8080";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const createAssignment = (formData) =>
  axios.post(`${BASE}/assignments`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getAllAssignments = () =>
  axios.get(`${BASE}/assignments`, authHeader());

export const getUpcomingAssignments = () =>
  axios.get(`${BASE}/assignments/upcoming`, authHeader());

export const getOverdueAssignments = () =>
  axios.get(`${BASE}/assignments/overdue`, authHeader());

export const deleteAssignment = (id) =>
  axios.delete(`${BASE}/assignments/${id}`, authHeader());

export const submitAssignment = (formData) =>
  axios.post(`${BASE}/submissions`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const checkSubmitted = (assignmentId) =>
  axios.get(`${BASE}/submissions/check/${assignmentId}`, authHeader());
