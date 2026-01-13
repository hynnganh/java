// src/services/authService.js
import api from "./api";

const authService = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },
};

export default authService;
