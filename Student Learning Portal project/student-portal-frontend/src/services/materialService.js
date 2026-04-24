import axios from "axios";

const BASE = "http://localhost:8080/materials";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export const getAllMaterials = () => axios.get(BASE, { headers: headers() });
export const getMyMaterials = () => axios.get(`${BASE}/my`, { headers: headers() });
export const getCourseMaterials = () => axios.get(`${BASE}/course`, { headers: headers() });
export const getMaterialsBySubject = (subjectId) => axios.get(`${BASE}/subject/${subjectId}`, { headers: headers() });
export const getMaterialsByCourseAndSubject = (courseId, subjectId) =>
  axios.get(`${BASE}/course/${courseId}/subject/${subjectId}`, { headers: headers() });
export const deleteMaterial = (id) =>
  axios.delete(`${BASE}/${id}`, { headers: headers() });

export const updateMaterialTitle = (id, title) =>
  axios.patch(`${BASE}/${id}/title`, JSON.stringify(title), {
    headers: { ...headers(), "Content-Type": "application/json" },
  });

export const uploadMaterial = (formData) =>
  axios.post(BASE, formData, {
    headers: {
      Authorization: `Bearer ${token()}`,
      // do NOT set Content-Type here — axios sets it automatically with the correct multipart boundary
    },
  });
