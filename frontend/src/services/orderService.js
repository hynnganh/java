// services/orderService.js
import api from './api';

const orderService = {
  // ========== PUBLIC ORDER APIs ==========

  // Tạo đơn hàng mới (cách 1)
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/public/orders', orderData);
      console.log('✅ Order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi tạo đơn hàng:', error);
      throw error;
    }
  },

  // Tạo đơn hàng từ giỏ hàng (cách 2 - có lẽ bạn đang dùng cách này)
  createOrderFromCart: async (email, cartId, paymentMethod, shippingAddress) => {
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
      console.log('✅ Order created from cart:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi tạo đơn hàng từ giỏ hàng:', error);
      throw error;
    }
  },

  getUserOrders: async (email) => {
    try {
      console.log("🔄 API Call: Getting orders for", email);
      const response = await api.get(`/public/users/${email}/orders`);
      console.log("📦 RAW API Response:", response);
      console.log("📦 Response data:", response.data);
      
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // DEBUG CHI TIẾT TỪNG ORDER
      orders.forEach((order, index) => {
        console.log(`📦 Order ${index + 1}:`, order);
        console.log(`   - Order ID:`, order.orderId);
        console.log(`   - Status:`, order.status);
        console.log(`   - OrderItems:`, order.orderItems);
        if (order.orderItems && order.orderItems.length > 0) {
          console.log(`   - First orderItem:`, order.orderItems[0]);
          console.log(`   - Product in orderItem:`, order.orderItems[0].product);
        }
      });
      
      // Xử lý dữ liệu để đảm bảo có products
      const processedOrders = orders.map(order => {
        // Lấy products từ orderItems
        let products = [];
        
        if (order.orderItems && Array.isArray(order.orderItems)) {
          products = order.orderItems.map(orderItem => ({
            // Thông tin từ orderItem
            orderItemId: orderItem.orderItemId,
            quantity: orderItem.quantity,
            discount: orderItem.discount,
            orderedProductPrice: orderItem.orderedProductPrice,
            // Thông tin từ product
            ...orderItem.product,
            // Đảm bảo có productId và productName
            productId: orderItem.product?.productId || orderItem.product?.id,
            productName: orderItem.product?.productName || orderItem.product?.name,
            price: orderItem.product?.price || orderItem.product?.unitPrice,
            image: orderItem.product?.image || orderItem.product?.imageUrl
          }));
        }
        
        console.log(`🛠️ Processed products for order ${order.orderId}:`, products);
        
        return {
          ...order,
          products: products,
          totalAmount: order.totalAmount || order.totalPrice || order.total || 0
        };
      });
      
      console.log("✅ Processed orders:", processedOrders);
      return processedOrders;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách đơn hàng:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (email, orderId) => {
    try {
      console.log("🔄 API Call: Getting order detail", orderId, "for", email);
      const response = await api.get(`/public/users/${email}/orders/${orderId}`);
      console.log("📦 RAW Order Detail Response:", response.data);
      
      const order = response.data;
      
      // Xử lý orderItems thành products
      let products = [];
      if (order.orderItems && Array.isArray(order.orderItems)) {
        products = order.orderItems.map(orderItem => ({
          // Thông tin từ orderItem
          orderItemId: orderItem.orderItemId,
          quantity: orderItem.quantity,
          discount: orderItem.discount,
          orderedProductPrice: orderItem.orderedProductPrice,
          // Thông tin từ product
          ...orderItem.product,
          // Đảm bảo có productId và productName
          productId: orderItem.product?.productId || orderItem.product?.id,
          productName: orderItem.product?.productName || orderItem.product?.name,
          price: orderItem.product?.price || orderItem.product?.unitPrice,
          image: orderItem.product?.image || orderItem.product?.imageUrl
        }));
      }
      
      console.log(`🛠️ Processed products for detail ${orderId}:`, products);
      
      return {
        ...order,
        products: products,
        totalAmount: order.totalAmount || order.totalPrice || order.total || 0
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', error);
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (email, orderId, reason = '') => {
    try {
      const response = await api.put(`/public/users/${email}/orders/${orderId}/cancel`, null, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi hủy đơn hàng:', error);
      throw error;
    }
  },

  // ========== ADMIN ORDER APIs ==========

  // Lấy tất cả đơn hàng (Admin)
  getAllOrders: async () => {
    try {
      const response = await api.get('/admin/orders');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy tất cả đơn hàng:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng (Admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
      throw error;
    }
  },

  // Debug APIs
  debugOrders: async () => {
    try {
      const response = await api.get('/admin/debug/orders');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi debug orders:', error);
      throw error;
    }
  },

  debugOrder: async (orderId) => {
    try {
      const response = await api.get(`/admin/debug/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi debug order:', error);
      throw error;
    }
  },

  // ========== ORDER UTILITIES ==========

  // Format trạng thái đơn hàng
  formatOrderStatus: (status) => {
    const statusMap = {
      'PENDING': { text: 'Chờ xác nhận', class: 'warning' },
      'CONFIRMED': { text: 'Đã xác nhận', class: 'info' },
      'PROCESSING': { text: 'Đang xử lý', class: 'primary' },
      'SHIPPED': { text: 'Đang giao hàng', class: 'secondary' },
      'DELIVERED': { text: 'Đã giao hàng', class: 'success' },
      'CANCELLED': { text: 'Đã hủy', class: 'danger' },
      'REFUNDED': { text: 'Đã hoàn tiền', class: 'dark' }
    };
    return statusMap[status] || { text: status, class: 'secondary' };
  },

  // Format phương thức thanh toán
  formatPaymentMethod: (method) => {
    const methodMap = {
      'COD': 'Thanh toán khi nhận hàng',
      'BANKING': 'Chuyển khoản ngân hàng',
      'MOMO': 'Ví MoMo',
      'ZALOPAY': 'Ví ZaloPay',
      'CREDIT_CARD': 'Thẻ tín dụng'
    };
    return methodMap[method] || method;
  },

  // THÊM PHƯƠNG THỨC FORMAT PRICE ĐỂ FIX LỖI
  formatPrice: (price) => {
    return (Number(price) || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  },

  // Tính tổng tiền đơn hàng từ products
  calculateOrderTotal: (order) => {
    if (!order) return 0;
    
    // Nếu đã có totalAmount từ API
    if (order.totalAmount || order.totalPrice || order.total) {
      return order.totalAmount || order.totalPrice || order.total;
    }
    
    // Tính từ products
    const products = order.products || order.orderItems || order.items || [];
    if (products.length === 0) return 0;
    
    return products.reduce((total, item) => {
      const price = item.productPrice || item.price || item.unitPrice || 0;
      const quantity = item.quantity || item.amount || 1;
      return total + (price * quantity);
    }, 0);
  },

  getOrderProducts: (order) => {
    if (!order) {
      console.log("❌ No order provided to getOrderProducts");
      return [];
    }
    
    console.log("🛠️ Getting products from order:", order);
    
    // Ưu tiên lấy từ products đã được xử lý
    if (order.products && Array.isArray(order.products)) {
      console.log("✅ Using pre-processed products");
      return order.products;
    }
    
    // Fallback: xử lý từ orderItems
    let products = [];
    if (order.orderItems && Array.isArray(order.orderItems)) {
      console.log("🔄 Processing from orderItems");
      products = order.orderItems.map((orderItem, index) => {
        console.log(`🛠️ Processing orderItem ${index + 1}:`, orderItem);
        
        // Lấy thông tin product từ orderItem.product
        const product = orderItem.product || {};
        
        // QUAN TRỌNG: CHỈ lấy quantity từ orderItem, không từ product
        const quantity = orderItem.quantity; // Chỉ lấy từ order_item
        
        console.log(`📦 Quantity from order_item: ${quantity}`);
        
        const processedItem = {
          // Thông tin từ orderItem - QUAN TRỌNG
          orderItemId: orderItem.orderItemId,
          quantity: quantity, // CHỈ lấy từ order_item
          discount: orderItem.discount || 0,
          orderedProductPrice: orderItem.orderedProductPrice || 0,
          
          // Thông tin từ product
          productId: product.productId || product.id || `unknown-${index}`,
          productName: product.productName || product.name || 'Sản phẩm không tên',
          image: product.image || product.imageUrl || '',
          price: product.price || product.unitPrice || product.productPrice || 0,
          description: product.description,
          
          // Tính toán giá sau discount
          finalPrice: orderItem.orderedProductPrice || product.price || 0
        };
        
        console.log(`✅ Processed product ${index + 1}:`, {
          name: processedItem.productName,
          quantity: processedItem.quantity, // Số lượng từ order_item
          price: processedItem.finalPrice,
          total: processedItem.quantity * processedItem.finalPrice
        });
        
        return processedItem;
      });
    }
    
    console.log("✅ Final processed products:", products);
    return products;
  },

  // Tính tổng tiền đơn hàng - CHỈ DÙNG QUANTITY TỪ ORDER_ITEM
  calculateOrderTotal: (order) => {
    if (!order) return 0;
    
    // Nếu đã có totalAmount từ API
    if (order.totalAmount || order.totalPrice || order.total) {
      return order.totalAmount || order.totalPrice || order.total;
    }
    
    // Tính từ orderItems (CHỈ dùng quantity từ orderItem)
    if (order.orderItems && Array.isArray(order.orderItems)) {
      const calculatedTotal = order.orderItems.reduce((total, item) => {
        const price = item.orderedProductPrice || item.product?.price || 0;
        const quantity = item.quantity || 0; // CHỈ lấy từ order_item
        const itemTotal = price * quantity;
        console.log(`💰 OrderItem ${item.orderItemId}: ${quantity} × ${price} = ${itemTotal}`);
        return total + itemTotal;
      }, 0);
      
      console.log(`💰 Calculated order total from order_items: ${calculatedTotal}`);
      return calculatedTotal;
    }
    
    // Tính từ products (fallback)
    const products = order.products || [];
    if (products.length === 0) return 0;
    
    const calculatedTotal = products.reduce((total, item) => {
      const price = item.finalPrice || item.orderedProductPrice || item.price || 0;
      const quantity = item.quantity || 0; // Đã được xử lý chỉ lấy từ order_item
      const itemTotal = price * quantity;
      console.log(`💰 Product ${item.productId}: ${quantity} × ${price} = ${itemTotal}`);
      return total + itemTotal;
    }, 0);
    
    console.log(`💰 Calculated products total: ${calculatedTotal}`);
    return calculatedTotal;
  },

  // Tính tổng tiền đơn hàng - SỬA LẠI ĐỂ TÍNH ĐÚNG
  calculateOrderTotal: (order) => {
    if (!order) return 0;
    
    // Nếu đã có totalAmount từ API
    if (order.totalAmount || order.totalPrice || order.total) {
      return order.totalAmount || order.totalPrice || order.total;
    }
    
    // Tính từ orderItems (sử dụng orderedProductPrice và quantity từ orderItem)
    if (order.orderItems && Array.isArray(order.orderItems)) {
      const calculatedTotal = order.orderItems.reduce((total, item) => {
        const price = item.orderedProductPrice || item.product?.price || 0;
        const quantity = item.quantity || 1; // Lấy quantity từ orderItem
        const itemTotal = price * quantity;
        console.log(`💰 OrderItem ${item.orderItemId}: ${quantity} × ${price} = ${itemTotal}`);
        return total + itemTotal;
      }, 0);
      
      console.log(`💰 Calculated order total: ${calculatedTotal}`);
      return calculatedTotal;
    }
    
    // Tính từ products
    const products = order.products || [];
    if (products.length === 0) return 0;
    
    const calculatedTotal = products.reduce((total, item) => {
      const price = item.finalPrice || item.orderedProductPrice || item.price || 0;
      const quantity = item.quantity || 1; // Lấy quantity từ processed product
      const itemTotal = price * quantity;
      console.log(`💰 Product ${item.productId}: ${quantity} × ${price} = ${itemTotal}`);
      return total + itemTotal;
    }, 0);
    
    console.log(`💰 Calculated products total: ${calculatedTotal}`);
    return calculatedTotal;
  },

  // Tính tổng tiền đơn hàng - SỬA LẠI
  calculateOrderTotal: (order) => {
    if (!order) return 0;
    
    // Nếu đã có totalAmount từ API
    if (order.totalAmount || order.totalPrice || order.total) {
      return order.totalAmount || order.totalPrice || order.total;
    }
    
    // Tính từ orderItems (sử dụng orderedProductPrice)
    if (order.orderItems && Array.isArray(order.orderItems)) {
      return order.orderItems.reduce((total, item) => {
        const price = item.orderedProductPrice || item.product?.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
    }
    
    // Tính từ products
    const products = order.products || [];
    if (products.length === 0) return 0;
    
    return products.reduce((total, item) => {
      const price = item.orderedProductPrice || item.price || item.unitPrice || item.productPrice || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  },

  // Format ngày tháng
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Kiểm tra có thể hủy đơn hàng không
  canCancelOrder: (order) => {
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  },

  // Đếm tổng số sản phẩm trong order
  getTotalItems: (order) => {
    const products = orderService.getOrderProducts(order);
    return products.reduce((total, item) => total + (item.quantity || 1), 0);
  }
};

export default orderService;