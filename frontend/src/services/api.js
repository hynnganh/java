import axios from "axios";

const api = axios.create({
  baseURL: window.location.hostname === "localhost" 
    ? "http://localhost:8080/api" 
    : "https://java-lbdz.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin-token") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("jwt-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 API Request: Đã gắn token vào Header");
    } else {
      console.warn("⚠️ API Request: Không tìm thấy Token trong LocalStorage!");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;