package com.ngocanh.anh05.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.ngocanh.anh05.entity.Cart;
import com.ngocanh.anh05.entity.CartItem;
import com.ngocanh.anh05.entity.Order;
import com.ngocanh.anh05.entity.OrderItem;
import com.ngocanh.anh05.entity.Payment;
import com.ngocanh.anh05.entity.Product;
import com.ngocanh.anh05.exceptions.APIException;
import com.ngocanh.anh05.exceptions.ResourceNotFoundException;
import com.ngocanh.anh05.payloads.OrderDTO;
import com.ngocanh.anh05.payloads.OrderItemDTO;
import com.ngocanh.anh05.payloads.OrderResponse;
import com.ngocanh.anh05.repository.CartItemRepo;
import com.ngocanh.anh05.repository.CartRepo;
import com.ngocanh.anh05.repository.OrderItemRepo;
import com.ngocanh.anh05.repository.OrderRepo;
import com.ngocanh.anh05.repository.PaymentRepo;
import com.ngocanh.anh05.repository.ProductRepo;
import com.ngocanh.anh05.service.OrderService;

import jakarta.transaction.Transactional;
@Slf4j
@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private ModelMapper modelMapper;

@Override
public OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod, String shippingAddress) {
    System.out.println("🛒 START placeOrder WITH ADDRESS: " + emailId + ", cartId: " + cartId + 
                     ", payment: " + paymentMethod + ", address: " + shippingAddress);

    // 1️⃣ Tìm giỏ hàng
    Cart cart = cartRepo.findCartByEmailAndCartId(emailId, cartId);
    if (cart == null) {
        throw new ResourceNotFoundException("Cart", "cartId", cartId);
    }

    if (cart.getCartItems().isEmpty()) {
        throw new APIException("Cart is empty");
    }

    System.out.println("📦 Cart found with " + cart.getCartItems().size() + " items, Total: " + cart.getTotalPrice());

    // 2️⃣ Tạo Order với shipping address - THÊM DEBUG
    Order order = new Order();
    order.setEmail(emailId);
    order.setOrderDate(LocalDate.now());
    order.setTotalAmount(cart.getTotalPrice());
    order.setOrderStatus("Order Accepted !");
    
    // ✅ QUAN TRỌNG: Đảm bảo shipping address được set
    if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
        order.setShippingAddress(shippingAddress.trim());
        System.out.println("📍 Shipping address SET: " + shippingAddress);
    } else {
        order.setShippingAddress("Chưa có địa chỉ");
        System.out.println("📍 Shipping address DEFAULT: Chưa có địa chỉ");
    }

    // 3️⃣ Tạo Payment
    Payment payment = new Payment();
    payment.setOrder(order);
    payment.setPaymentMethod(paymentMethod);
    payment = paymentRepo.save(payment);
    order.setPayment(payment);

    // 4️⃣ Lưu Order trước
    Order savedOrder = orderRepo.save(order);
    System.out.println("✅ Order saved with ID: " + savedOrder.getOrderId() + 
                      ", Shipping Address in DB: " + savedOrder.getShippingAddress());

    List<OrderItem> orderItems = new ArrayList<>();
    for (CartItem cartItem : cart.getCartItems()) {
        Product product = cartItem.getProduct();
        
        // Kiểm tra tồn kho ngay tại đây để tránh tạo OrderItem thừa
        if (product.getQuantity() < cartItem.getQuantity()) {
            throw new APIException("Sản phẩm " + product.getProductName() + " đã hết hàng!");
        }

        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setQuantity(cartItem.getQuantity());
        orderItem.setDiscount(cartItem.getDiscount());
        orderItem.setOrderedProductPrice(cartItem.getProductPrice());
        orderItem.setOrder(savedOrder);
        orderItems.add(orderItem);

        // Cập nhật số lượng sản phẩm
        product.setQuantity(product.getQuantity() - cartItem.getQuantity());
        productRepo.save(product);
    }

    orderItemRepo.saveAll(orderItems);

    // 6️⃣ Xóa CartItems và dọn giỏ hàng
    cartItemRepo.deleteAll(cart.getCartItems()); // Dùng deleteAll cho nhanh
    cart.getCartItems().clear();
    cart.setTotalPrice(0.0);
    cartRepo.save(cart);

    // 7️⃣ Trả về DTO (Dùng savedOrder đã được cập nhật list orderItems)
    savedOrder.setOrderItems(orderItems);
    return modelMapper.map(savedOrder, OrderDTO.class);}

    // ✅ PHƯƠNG THỨC CŨ: Giữ để tương thích (không có shipping address)
    // @Override
    // public OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod) {
    //     // Sử dụng địa chỉ mặc định
    //     return placeOrder(emailId, cartId, paymentMethod, "Chưa có địa chỉ");
    // }

    // ---------------------- GET SINGLE ORDER ----------------------
    @Override
    public OrderDTO getOrder(String emailId, Long orderId) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);
        if (order == null) {
            throw new ResourceNotFoundException("Order", "orderId", orderId);
        }
        return modelMapper.map(order, OrderDTO.class);
    }

    // ---------------------- GET ALL ORDERS (ADMIN) ----------------------
    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepo.findAll(pageDetails);
        List<Order> orders = pageOrders.getContent();

        List<OrderDTO> orderDTO = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());

        if (orderDTO.isEmpty()) {
            throw new APIException("No orders placed yet by the users");
        }

        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTO);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());

        return orderResponse;
    }

// ---------------------- UPDATE ORDER STATUS (FIXED) ----------------------
    @Override
    @Transactional 
    public OrderDTO updateOrder(Long orderId, String orderStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        order.setOrderStatus(orderStatus);
        Order updatedOrder = orderRepo.save(order);
        return modelMapper.map(updatedOrder, OrderDTO.class);
    }


    @Override
    @Transactional
    public OrderDTO cancelOrder(String email, Long orderId, String reason) {
        Order order = orderRepo.findByEmailAndOrderId(email, orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        List<String> validStatuses = Arrays.asList("PENDING", "Order Accepted !");
        
        if (!validStatuses.contains(order.getOrderStatus())) {
            throw new APIException("Đơn hàng đang ở trạng thái '" + order.getOrderStatus() + "', không thể hủy!");
        }
        order.getOrderItems().forEach(item -> {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepo.save(product);
            }
        });
        order.setOrderStatus("CANCELLED");
        Order updatedOrder = orderRepo.save(order);

        log.info("✅ Đơn hàng #{} đã được hủy. Lý do: {}", orderId, reason);

        return modelMapper.map(updatedOrder, OrderDTO.class);
    }

    // ✅ THÊM PHƯƠNG THỨC MỚI: Cập nhật địa chỉ giao hàng
    public OrderDTO updateShippingAddress(String emailId, Long orderId, String shippingAddress) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);
        if (order == null) {
            throw new ResourceNotFoundException("Order", "orderId", orderId);
        }

        order.setShippingAddress(shippingAddress);
        orderRepo.save(order);
        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    public List<OrderDTO> getOrdersByUser(String emailId) {
        List<Order> orders = orderRepo.findAllByEmail(emailId);
        return orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'placeOrder'");
    }

    
}