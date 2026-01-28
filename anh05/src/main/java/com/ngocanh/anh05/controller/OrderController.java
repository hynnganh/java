package com.ngocanh.anh05.controller;
import org.hibernate.Hibernate;
import com.ngocanh.anh05.entity.Order;
import com.ngocanh.anh05.entity.Product;
import com.ngocanh.anh05.payloads.OrderDTO;
import com.ngocanh.anh05.payloads.OrderResponse;
import com.ngocanh.anh05.repository.OrderRepo;
import com.ngocanh.anh05.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepo orderRepo; // ✅ THÊM INJECT NÀY

    // ✅ SỬA ENDPOINT CŨ: Thêm shipping address
    @PostMapping("/public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order")
    public ResponseEntity<OrderDTO> orderProducts(
            @PathVariable String emailId,
            @PathVariable Long cartId,
            @PathVariable String paymentMethod,
            @RequestParam(required = false, defaultValue = "Chưa có địa chỉ") String shippingAddress) { // ✅ THÊM PARAM

        OrderDTO order = orderService.placeOrder(emailId, cartId, paymentMethod, shippingAddress);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    // ✅ ENDPOINT MỚI: Place order với shipping address
    @PostMapping("/public/users/{emailId}/carts/{cartId}/place-order")
    public ResponseEntity<OrderDTO> placeOrderWithAddress(
            @PathVariable String emailId,
            @PathVariable Long cartId,
            @RequestParam String paymentMethod,
            @RequestParam String shippingAddress) {
        
        OrderDTO orderDTO = orderService.placeOrder(emailId, cartId, paymentMethod, shippingAddress);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }

    // Endpoint cũ: Giữ để tương thích
    @PostMapping("/public/orders")
    public ResponseEntity<OrderDTO> placeOrder(@RequestBody OrderDTO orderDTO) {
        OrderDTO createdOrder = orderService.placeOrder(
            orderDTO.getEmail(), 
            null,
            "COD",
            orderDTO.getShippingAddress() != null ? orderDTO.getShippingAddress() : "Chưa có địa chỉ"
        );
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    // ✅ ENDPOINT MỚI: Cập nhật địa chỉ giao hàng
    @PutMapping("/public/users/{emailId}/orders/{orderId}/shipping-address")
    public ResponseEntity<OrderDTO> updateShippingAddress(
            @PathVariable String emailId,
            @PathVariable Long orderId,
            @RequestParam String shippingAddress) {
        
        OrderDTO orderDTO = orderService.updateShippingAddress(emailId, orderId, shippingAddress);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }
    @GetMapping("/admin/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderDetailsForAdmin(@PathVariable Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));
        
        OrderDTO orderDTO = orderService.getOrder(order.getEmail(), orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }


    @Transactional(readOnly = true)
    @GetMapping("/admin/debug/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> debugOrder(@PathVariable Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getOrderId());
        response.put("email", order.getEmail());
        response.put("shippingAddress", order.getShippingAddress());
        response.put("totalAmount", order.getTotalAmount());

        List<Map<String, Object>> items = order.getOrderItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            
            // CHIÊU CUỐI: Ép Hibernate nạp Product thật từ DB
            Product p = item.getProduct();
            if (p != null) {
                Hibernate.initialize(p); // Ép nạp dữ liệu thật vào Proxy
                itemMap.put("productName", p.getProductName()); // Đây là "Sữa Rửa Mặt Simple" nè
                itemMap.put("image", p.getImage());
            } else {
                itemMap.put("productName", "Không tìm thấy SP");
            }
            
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("orderedProductPrice", item.getOrderedProductPrice());
            return itemMap;
        }).collect(Collectors.toList());

        response.put("orderItems", items);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/debug/orders")
        public ResponseEntity<List<Map<String, Object>>> debugAllOrders() {
            List<Order> orders = orderRepo.findAll();
            List<Map<String, Object>> result = orders.stream()
                    .map(order -> {
                        Map<String, Object> orderInfo = new HashMap<>();
                        orderInfo.put("orderId", order.getOrderId());
                        orderInfo.put("email", order.getEmail());
                        orderInfo.put("shippingAddress", order.getShippingAddress());
                        orderInfo.put("totalAmount", order.getTotalAmount());
                        orderInfo.put("orderStatus", order.getOrderStatus());
                        return orderInfo;
                    })
                    .collect(Collectors.toList());
            
            System.out.println("🔍 DEBUG All Orders: " + result.size() + " orders found");
            
            return ResponseEntity.ok(result);
        }

    @GetMapping("/admin/orders")
    public ResponseEntity<OrderResponse> getAllOrders(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "orderId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        
        OrderResponse orders = orderService.getAllOrders(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @GetMapping("/public/users/{emailId}/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable String emailId) {
        List<OrderDTO> orders = orderService.getOrdersByUser(emailId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @GetMapping("/public/users/{emailId}/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable String emailId,
            @PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrder(emailId, orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String orderStatus) {
        OrderDTO orderDTO = orderService.updateOrder(orderId, orderStatus);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PutMapping("/public/users/{email:.+}/orders/{orderId}/cancel")
public ResponseEntity<OrderDTO> cancelOrder(@PathVariable String email, 
                                            @PathVariable Long orderId,
                                            @RequestParam String reason) {
    OrderDTO orderDTO = orderService.cancelOrder(email, orderId, reason);
    return new ResponseEntity<>(orderDTO, HttpStatus.OK);
}

}