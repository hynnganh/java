// // // src/services/api.js
// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: "http://localhost:8080/api",
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// // // 🛡️ Nếu có token -> tự động gắn vào header
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // export default api;
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🛡️ Tự động gắn Token vào Header cho cả User và Admin
// api.interceptors.request.use(
//   (config) => {
//     // Ưu tiên lấy admin-token trước, nếu không có thì lấy token user
//     const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ Tự động gắn Token vào Header cho cả User và Admin
api.interceptors.request.use(
  (config) => {
    // 1. Thử lấy tất cả các tên key có khả năng (Sửa lại cho đúng thực tế storage của mày)
    const token = localStorage.getItem("admin-token") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("jwt-token"); // Thêm cái này nếu mày lưu là jwt-token
    
    // 2. Kiểm tra xem có lấy được token không
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log này để mày chắc chắn là request GỬI ĐI đã có token
      console.log("🔑 API Request: Đã gắn token vào Header");
    } else {
      // Log này cảnh báo nếu chưa lấy được token từ LocalStorage
      console.warn("⚠️ API Request: Không tìm thấy Token trong LocalStorage!");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;