package com.ngocanh.anh05.payloads;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private Double totalPrice = 0.0;
    private String userEmail;
    private List<ProductDTO> products = new ArrayList<>();


    public int getTotalItems() {
        return products != null ? products.size() : 0;
    }
    
    public boolean hasProductsWithImages() {
        if (products == null) return false;
        return products.stream().anyMatch(product -> product.getImage() != null && !product.getImage().isEmpty());
    }
}