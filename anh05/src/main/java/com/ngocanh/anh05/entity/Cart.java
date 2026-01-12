// package com.ngocanh.anh05.entity;

// import java.util.ArrayList;
// import java.util.List;
// import jakarta.persistence.*;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Data
// @Table(name = "carts")
// @NoArgsConstructor
// @AllArgsConstructor
// public class Cart {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long cartId;

//     @OneToOne
//     @JoinColumn(name = "user_id")
//     private User user;

//     @OneToMany(mappedBy = "cart", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
//     private List<CartItem> cartItems = new ArrayList<>();

//     private Double totalPrice = 0.0;
// }

package com.ngocanh.anh05.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "carts")
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "cart", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();

    private Double totalPrice = 0.0;
    
    // 🆕 THÊM FIELD isActive
    private Boolean isActive = true;
    
    // 🆕 THÊM FIELD createdAt
    private Date createdAt = new Date();

    
}