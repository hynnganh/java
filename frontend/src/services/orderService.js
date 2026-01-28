import api from './api';

const orderService = {
  // ========== USER APIs ==========

  getUserOrders: async (email) => {
    try {
      const response = await api.get(`/public/users/${email}/orders`);
      const orders = Array.isArray(response.data) ? response.data : [];
      
      return orders.map(order => ({
        ...order,
        products: orderService.getOrderProducts(order),
        totalAmount: order.totalAmount || order.totalPrice || 0
      }));
    } catch (error) {
      console.error('❌ Lỗi load đơn hàng:', error);
      throw error;
    }
  },

  getOrderDetail: async (email, orderId) => {
    try {
      const response = await api.get(`/public/users/${email}/orders/${orderId}`);
      const order = response.data;
      return {
        ...order,
        products: orderService.getOrderProducts(order),
        totalAmount: order.totalAmount || order.totalPrice || 0
      };
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
      throw error;
    }
  },

  // FIX LỖI 401 VÀ GỬI REASON CHUẨN
// services/orderService.js
cancelOrder: async (email, orderId, reason) => {
    // Không thèm lấy token, không gửi Header Authorization luôn
    return await api.put(
        `/public/users/${email}/orders/${orderId}/cancel`, 
        null, 
        { params: { reason: reason } } // Chỉ gửi reason
    );
},

  createOrderFromCart: async (email, cartId, paymentMethod, shippingAddress) => {
    const response = await api.post(
      `/public/users/${email}/carts/${cartId}/place-order`,
      null,
      { params: { paymentMethod, shippingAddress } }
    );
    return response.data;
  },

  // ========== ADMIN APIs ==========

  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/admin/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // ========== UTILITIES (Dọn dẹp trùng lặp) ==========

  formatOrderStatus: (status) => {
    const statusMap = {
      'PENDING': { text: 'Chờ xác nhận', class: 'warning' },
      'Order Accepted !': { text: 'Đã xác nhận', class: 'info' },
      'SHIPPED': { text: 'Đang giao hàng', class: 'secondary' },
      'DELIVERED': { text: 'Đã giao hàng', class: 'success' },
      'CANCELLED': { text: 'Đã hủy', class: 'danger' }
    };
    return statusMap[status] || { text: status, class: 'secondary' };
  },

  formatPrice: (price) => {
    return (Number(price) || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  },

  getOrderProducts: (order) => {
    if (!order || !order.orderItems) return [];
    return order.orderItems.map(item => ({
      ...item.product,
      quantity: item.quantity,
      orderedProductPrice: item.orderedProductPrice,
      productName: item.product?.productName || 'Sản phẩm không tên'
    }));
  },

  calculateOrderTotal: (order) => {
    if (!order) return 0;
    if (order.totalAmount) return order.totalAmount;
    
    const items = order.orderItems || [];
    return items.reduce((total, item) => {
      return total + (item.orderedProductPrice * item.quantity);
    }, 0);
  }
};

export default orderService;