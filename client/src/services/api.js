import axios from "axios";
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API = axios.create({
  baseURL: `${BASE}/api`,
});
export const signup = (formData) => API.post("/auth/signup", formData);
export const login = (formData) => API.post("/auth/login", formData);
