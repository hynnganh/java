import api from "./api";

const authService = {
  register: (data) => api.post("/register", data),

  login: (data) => api.post("/login", data),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  },
};

export default authService;
