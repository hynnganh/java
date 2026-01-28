import api from "./api";

const productService = {
  // ✅ 1. Lấy danh sách sản phẩm dành riêng cho ADMIN (Hàm mới thêm)
  async getAllProductsAD(page = 0, limit = 50) {
    try {
      const { data } = await api.get(`/admin/products`, {
        params: { 
          pageNumber: page, 
          pageSize: limit 
        }
      });
      return data; 
    } catch (error) {
      console.error("❌ Lỗi Admin lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // ✅ 2. Lấy tất cả sản phẩm (Public)
  async getAllProducts(page = 0, limit = 8) {
    try {
      const { data } = await api.get(`/public/products`, {
        params: { pageNumber: page, pageSize: limit }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // ✅ 3. Lấy theo danh mục
  async getProductsByCategory(categoryId, page = 0, limit = 8) {
    try {
      const { data } = await api.get(`/public/categories/${categoryId}/products`, {
        params: { pageNumber: page, pageSize: limit }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy sản phẩm theo danh mục:", error);
      throw error;
    }
  },

  // ✅ 4. Tìm kiếm theo từ khóa
  async searchProducts(keyword, page = 0, limit = 8) {
    try {
      const { data } = await api.get(`/public/products/keyword/${encodeURIComponent(keyword)}`, {
        params: { pageNumber: page, pageSize: limit }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  },

  // ✅ 5. Tìm theo danh mục VÀ từ khóa
  async getProductsByCategoryAndSearch(categoryId, keyword, page = 0, limit = 8) {
    try {
      const { data } = await api.get(`/public/products/keyword/${encodeURIComponent(keyword)}`, {
        params: { 
          pageNumber: page, 
          pageSize: limit,
          categoryId: categoryId 
        }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm theo danh mục và từ khóa:", error);
      throw error;
    }
  },

  // ✅ 6. Lấy chi tiết sản phẩm
  async getProductById(productId) {
    try {
      const { data } = await api.get(`/public/products/${productId}`);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
      throw error;
    }
  }
};

export default productService;