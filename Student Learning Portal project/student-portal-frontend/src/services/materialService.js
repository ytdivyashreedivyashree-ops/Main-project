import axios from "axios";

const BASE_URL = "http://localhost:8080/materials";

export const uploadMaterial = (formData) =>
  axios.post(BASE_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllMaterials = () => axios.get(BASE_URL);
