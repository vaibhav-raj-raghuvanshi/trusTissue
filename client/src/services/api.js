import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

export const signup = (formData) => API.post("/auth/signup", formData);
export const login = (formData) => API.post("/auth/login", formData);
