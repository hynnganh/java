import api from './api';

const cartService = {
  // ========== QUẢN LÝ GIỎ HÀNG (API) ==========

  // Lấy giỏ hàng đang hoạt động của người dùng
  getActiveCart: async (email) => {
    try {
      const response = await api.get(`/public/users/${email}/carts/active`);
      if (response.data) {
        cartService.updateCartInStorage(response.data); // Đồng bộ LocalStorage
      }
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy giỏ hàng:', error);
      throw error;
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (cartId, productId, quantity) => {
    try {
      const response = await api.post(`/public/carts/${cartId}/products/${productId}/quantity/${quantity}`);
      // Refresh lại dữ liệu từ server sau khi thêm thành công để đảm bảo tính chính xác
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      throw error;
    }
  },

  // Cập nhật số lượng sản phẩm
  updateQuantity: async (cartId, productId, quantity) => {
    try {
      const response = await api.put(`/public/carts/${cartId}/products/${productId}/quantity/${quantity}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số lượng:', error);
      throw error;
    }
  },

  // Xóa một sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartId, productId) => {
    try {
      const response = await api.delete(`/public/carts/${cartId}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi xóa sản phẩm:', error);
      throw error;
    }
  },

  // ========== QUẢN LÝ ĐẶT HÀNG (ORDER) ==========

  createOrder: async (email, cartId, paymentMethod, shippingAddress) => {
    try {
      const response = await api.post(
        `/public/users/${email}/carts/${cartId}/place-order`,
        null, 
        {
          params: {
            paymentMethod: paymentMethod,
            shippingAddress: shippingAddress
          }
        }
      );
      
      // ĐẶC BIỆT: Sau khi đặt hàng thành công, giỏ hàng trên server thường sẽ bị xóa/đóng
      cartService.clearCartFromStorage(); 
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi tạo đơn hàng:', error);
      throw error;
    }
  },

  // Làm rỗng giỏ hàng
  clearCart: async (email, cartId) => {
    try {
      // Ưu tiên gọi API xóa toàn bộ (nếu backend hỗ trợ)
      await api.delete(`/public/users/${email}/carts/${cartId}/clear`);
    } catch (error) {
      console.warn('🔄 Fallback: Xóa thủ công từng sản phẩm...');
      const cart = await cartService.getActiveCart(email);
      if (cart && cart.products) {
        // Sử dụng Promise.all để xóa đồng thời các sản phẩm, nhanh hơn vòng lặp thường
        await Promise.all(
          cart.products.map(p => cartService.removeFromCart(cartId, p.productId))
        );
      }
    } finally {
      cartService.clearCartFromStorage();
    }
  },

  // ========== TIỆN ÍCH (UTILITIES) ==========

  // Tính tổng tiền giỏ hàng
  calculateTotal: (cartItems) => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.specialPrice || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  },

  // Định dạng giá tiền VNĐ
  formatPrice: (price) => {
    return (Number(price) || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  },

  // ========== QUẢN LÝ LOCAL STORAGE (ĐỒNG BỘ UI) ==========

  updateCartInStorage: (cartData) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartData));
      // Dispatch event để các component khác (như Header) nhận biết sự thay đổi
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Error storage cart', e);
    }
  },

  getCartFromStorage: () => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : null;
  },

  clearCartFromStorage: () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  },

  // Lấy tổng số lượng item để hiển thị Badge trên icon Giỏ hàng
  getCartCount: () => {
    const cart = cartService.getCartFromStorage();
    if (!cart || !cart.products) return 0;
    return cart.products.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
};

export default cartService;