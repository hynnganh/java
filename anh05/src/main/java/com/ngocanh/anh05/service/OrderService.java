package com.ngocanh.anh05.service;

import java.util.List;

import com.ngocanh.anh05.payloads.OrderDTO;
import com.ngocanh.anh05.payloads.OrderResponse;

public interface OrderService {

    // ✅ PHƯƠNG THỨC MỚI: Place order với shipping address
    OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod, String shippingAddress);
    
    // Phương thức cũ (giữ để tương thích)
    OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod);

    OrderDTO getOrder(String emailId, Long orderId);

    List<OrderDTO> getOrdersByUser(String emailId);

    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderDTO updateOrder(String emailId, Long orderId, String orderStatus);
    
    // ✅ THÊM PHƯƠNG THỨC MỚI: Cập nhật địa chỉ giao hàng
    OrderDTO updateShippingAddress(String emailId, Long orderId, String shippingAddress);
}