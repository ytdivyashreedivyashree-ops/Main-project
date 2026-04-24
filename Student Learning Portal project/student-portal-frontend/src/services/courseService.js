import axios from "axios";

const BASE = "http://localhost:8080";

export const getAllCourses = () => axios.get(`${BASE}/courses`);
