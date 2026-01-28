package com.ngocanh.anh05.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ngocanh.anh05.entity.Order;
import java.util.Optional;
@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.email = ?1 AND o.id = ?2")
    Order findOrderByEmailAndOrderId(String email, Long orderId);
    List<Order> findAllByEmail(String email);   
    Optional<Order> findByEmailAndOrderId(String email, Long orderId);

    List<Order> findByEmail(String email);
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderItems oi " +
           "WHERE o.email = :email " +
           "AND o.orderStatus = :status " +
           "AND oi.product.productId = :productId")
    boolean existsByEmailAndOrderStatusAndOrderItemsProductProductId(
            @Param("email") String email, 
            @Param("status") String status, 
            @Param("productId") Long productId);
}
