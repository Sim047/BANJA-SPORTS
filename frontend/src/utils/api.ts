// src/utils/api.ts
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API + "/api",
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default api;
