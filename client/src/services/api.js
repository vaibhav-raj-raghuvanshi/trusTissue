import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:5000/api",
});
export const signup = (formData) => API.post("/auth/signup", formData);
export const login = (formData) => API.post("/auth/login", formData);
