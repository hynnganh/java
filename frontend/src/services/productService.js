import api from "./api";

const productService = {
  // ✅ Lấy tất cả sản phẩm
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

  // ✅ Lấy theo danh mục
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

  // ✅ Tìm kiếm theo từ khóa (Fix đúng đường dẫn /keyword/{keyword})
  async searchProducts(keyword, page = 0, limit = 8) {
    try {
      // Backend của bạn dùng PathVariable cho keyword
      const { data } = await api.get(`/public/products/keyword/${encodeURIComponent(keyword)}`, {
        params: { pageNumber: page, pageSize: limit }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  },

  // ✅ Tìm theo danh mục VÀ từ khóa
  async getProductsByCategoryAndSearch(categoryId, keyword, page = 0, limit = 8) {
    try {
      const { data } = await api.get(`/public/products/keyword/${encodeURIComponent(keyword)}`, {
        params: { 
          pageNumber: page, 
          pageSize: limit,
          categoryId: categoryId // Backend nhận categoryId làm RequestParam trong searchProductByKeyword
        }
      });
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm theo danh mục và từ khóa:", error);
      throw error;
    }
  },

  // ✅ Lấy chi tiết sản phẩm
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