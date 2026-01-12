package com.ngocanh.anh05.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Email
    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    private LocalDate orderDate;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    private Double totalAmount;
    private String orderStatus;
    
    // ✅ THÊM TRƯỜNG SHIPPING ADDRESS
    @Column(name = "shipping_address", nullable = false, length = 500)
    private String shippingAddress = "Chưa có địa chỉ"; // Giá trị mặc định

    // ✅ THÊM CONSTRUCTOR KHÔNG CÓ shippingAddress để tương thích
    public Order(String email, List<OrderItem> orderItems, LocalDate orderDate, 
                Payment payment, Double totalAmount, String orderStatus) {
        this.email = email;
        this.orderItems = orderItems;
        this.orderDate = orderDate;
        this.payment = payment;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.shippingAddress = "Chưa có địa chỉ"; // Giá trị mặc định
    }
}