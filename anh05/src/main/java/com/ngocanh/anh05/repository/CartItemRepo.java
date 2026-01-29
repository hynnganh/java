package com.ngocanh.anh05.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ngocanh.anh05.entity.Cart;
import com.ngocanh.anh05.entity.CartItem;
import com.ngocanh.anh05.entity.Product;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {

    @Query("SELECT ci.product FROM CartItem ci WHERE ci.product.productId = ?1")
    Product findProductById(Long productId);
   
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = ?1 AND ci.product.productId = ?2")
    CartItem findCartItemByProductIdAndCartId(Long cartId, Long productId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = ?1 AND ci.product.productId = ?2")
    void deleteCartItemByProductIdAndCartId(Long cartId, Long productId);
    CartItem findByCartAndProduct(Cart cart, Product product);
}
