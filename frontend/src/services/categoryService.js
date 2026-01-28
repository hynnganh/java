// import api from "./api";

// const categoryService = {
//   // Lấy danh sách (Public): GET /api/public/categories
//   async getAllCategories() {
//     try {
//       const { data } = await api.get("/public/categories");

//       // ✅ Kiểm tra nếu API có trả về content
//       if (Array.isArray(data)) return data;
//       if (data.content && Array.isArray(data.content)) return data.content;

//       console.warn("⚠️ Dữ liệu danh mục không phải mảng:", data);
//       return [];
//     } catch (error) {
//       console.error("❌ Lỗi khi lấy danh mục:", error);
//       return [];
//     }
//   },

//   // Tạo mới (Admin): POST /api/admin/categories
//   async createCategory(categoryData) {
//     const token = localStorage.getItem("token"); // Lấy token để check quyền ADMIN
//     return await api.post("/admin/categories", categoryData, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//   },

//   // Cập nhật (Admin): PUT /api/admin/categories/{id}
//   async updateCategory(categoryId, categoryData) {
//     const token = localStorage.getItem("token");
//     return await api.put(`/admin/categories/${categoryId}`, categoryData, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//   },

//   // Xóa (Admin): DELETE /api/admin/categories/{id}
//   async deleteCategory(categoryId) {
//     const token = localStorage.getItem("token");
//     return await api.delete(`/admin/categories/${categoryId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//   }
// };

// export default categoryService;

import api from "./api";

const categoryService = {
  // 🔐 Hàm bổ trợ lấy Token - Check cả 2 key để tránh bị văng
  getAuthHeader() {
    const token = localStorage.getItem("token") || localStorage.getItem("admin-token");
    console.log("🔑 [Service] Sử dụng Token:", token ? "✅ Đã lấy" : "❌ KHÔNG THẤY");
    return { 
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      } 
    };
  },

  // 🟢 Public: Lấy tất cả danh mục
  async getAllCategories() {
    try {
      const { data } = await api.get("/public/categories");
      console.log("📥 [Service] GET Data:", data);

      // Xử lý linh hoạt cho cả CategoryResponse (content) hoặc mảng thuần
      if (data.content && Array.isArray(data.content)) return data.content;
      if (Array.isArray(data)) return data;
      
      return [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh mục:", error);
      return [];
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const { data } = await api.get(`/public/categories/${categoryId}`);
      
      console.log(`📥 [Service] GET Products for Category ${categoryId}:`, data);

      if (data.content && Array.isArray(data.content)) return data.content;
      if (data.products && Array.isArray(data.products)) return data.products;
      if (Array.isArray(data)) return data;

      return [];
    } catch (error) {
      console.error(`❌ Lỗi khi lấy sản phẩm của danh mục ${categoryId}:`, error);
      throw error; 
    }
  },

  // 🔴 Admin: Tạo danh mục mới
  async createCategory(categoryDTO) {
    try {
      // POST /api/admin/categories
      const { data } = await api.post("/admin/categories", categoryDTO, this.getAuthHeader());
      return data;
    } catch (error) {
      console.error("❌ Lỗi Admin tạo:", error.response?.data || error.message);
      throw error; 
    }
  },

  // 🟠 Admin: Cập nhật danh mục
  async updateCategory(categoryId, categoryDTO) {
    try {
      // PUT /api/admin/categories/{categoryId}
      const { data } = await api.put(`/admin/categories/${categoryId}`, categoryDTO, this.getAuthHeader());
      return data;
    } catch (error) {
      console.error("❌ Lỗi Admin cập nhật:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🟡 Admin: Xóa danh mục
  async deleteCategory(categoryId) {
    try {
      // DELETE /api/admin/categories/{categoryId}
      const { data } = await api.delete(`/admin/categories/${categoryId}`, this.getAuthHeader());
      return data;
    } catch (error) {
      console.error("❌ Lỗi Admin xóa:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default categoryService;