import axios from "axios";

const BASE_URL = "http://localhost:8080/auth";

export const loginUser = (loginData) =>
  axios.post(`${BASE_URL}/login`, loginData);

export const registerUser = (registerData) =>
  axios.post(`${BASE_URL}/register`, registerData);
