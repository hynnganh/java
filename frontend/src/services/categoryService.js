// src/services/categoryService.js
import api from "./api";

const categoryService = {
  // 🟢 Public: Lấy tất cả danh mục
  async getAllCategories() {
    try {
      const { data } = await api.get("/public/categories");

      // ✅ Kiểm tra nếu API có trả về content
      if (Array.isArray(data)) return data;
      if (data.content && Array.isArray(data.content)) return data.content;

      console.warn("⚠️ Dữ liệu danh mục không phải mảng:", data);
      return [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh mục:", error);
      return [];
    }
  },
};

export default categoryService;
