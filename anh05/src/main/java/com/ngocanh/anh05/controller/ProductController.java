package com.ngocanh.anh05.controller;

import com.ngocanh.anh05.entity.Product;
import com.ngocanh.anh05.payloads.ProductDTO;
import com.ngocanh.anh05.payloads.ProductResponse;
import com.ngocanh.anh05.service.ProductService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ===================== ADD PRODUCT =====================
    @PostMapping("/admin/categories/{categoryId}/products")
    public ResponseEntity<EntityModel<ProductDTO>> addProduct(
            @RequestBody @Valid Product product,
            @PathVariable Long categoryId) {

        ProductDTO savedProduct = productService.addProduct(categoryId, product);

        EntityModel<ProductDTO> model = EntityModel.of(savedProduct);
        model.add(linkTo(methodOn(ProductController.class)
                .getOneProduct(savedProduct.getProductId())).withSelfRel());

        return ResponseEntity.status(HttpStatus.CREATED).body(model);
    }

    // ===================== GET ONE PRODUCT =====================
    @GetMapping("/public/products/{productId}")
    public ResponseEntity<EntityModel<ProductDTO>> getOneProduct(
            @PathVariable Long productId) {

        ProductDTO dto = productService.getProductById(productId);

        EntityModel<ProductDTO> model = EntityModel.of(dto);
        model.add(linkTo(methodOn(ProductController.class)
                .getOneProduct(productId)).withSelfRel());

        return ResponseEntity.ok(model);
    }

    // ===================== GET ALL PRODUCTS =====================
    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "40") Integer pageSize,
            @RequestParam(defaultValue = "productId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        ProductResponse productResponse = productService.getAllProducts(
                pageNumber == 0 ? pageNumber : pageNumber - 1,
                pageSize,
                "id".equals(sortBy) ? "productId" : sortBy,
                sortOrder
        );

        return ResponseEntity.ok(productResponse);
    }

    // ===================== GET PRODUCTS BY CATEGORY =====================
    @GetMapping("/public/categories/{categoryId}/products")
    public ResponseEntity<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "50") Integer pageSize,
            @RequestParam(defaultValue = "productId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        ProductResponse productResponse = productService.searchByCategory(
                categoryId,
                pageNumber == 0 ? pageNumber : pageNumber - 1,
                pageSize,
                "id".equals(sortBy) ? "productId" : sortBy,
                sortOrder
        );

        return ResponseEntity.ok(productResponse);
    }

    // ===================== SEARCH BY KEYWORD =====================
    @GetMapping("/public/products/keyword/{keyword}")
    public ResponseEntity<ProductResponse> getProductsByKeyword(
            @PathVariable String keyword,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "50") Integer pageSize,
            @RequestParam(defaultValue = "productId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "0") Long categoryId) {

        ProductResponse productResponse = productService.searchProductByKeyword(
                keyword,
                categoryId,
                pageNumber == 0 ? pageNumber : pageNumber - 1,
                pageSize,
                "id".equals(sortBy) ? "productId" : sortBy,
                sortOrder
        );

        return ResponseEntity.ok(productResponse);
    }

    // ===================== GET IMAGE =====================
    @GetMapping("/public/products/image/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(
            @PathVariable String fileName) throws FileNotFoundException {

        InputStream imageStream = productService.getProductImage(fileName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("inline", fileName);

        return new ResponseEntity<>(new InputStreamResource(imageStream), headers, HttpStatus.OK);
    }

    // ===================== UPDATE PRODUCT =====================
    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<EntityModel<ProductDTO>> updateProduct(
            @RequestBody Product product,
            @PathVariable Long productId) {

        ProductDTO updatedProduct = productService.updateProduct(productId, product);

        EntityModel<ProductDTO> model = EntityModel.of(updatedProduct);
        model.add(linkTo(methodOn(ProductController.class)
                .getOneProduct(productId)).withSelfRel());

        return ResponseEntity.ok(model);
    }

    // ===================== UPDATE PRODUCT IMAGE =====================
    @PutMapping("/admin/products/{productId}/image")
    public ResponseEntity<EntityModel<ProductDTO>> updateProductImage(
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile image) throws IOException {

        ProductDTO updatedProduct = productService.updateProductImage(productId, image);

        EntityModel<ProductDTO> model = EntityModel.of(updatedProduct);
        model.add(linkTo(methodOn(ProductController.class)
                .getOneProduct(productId)).withSelfRel());

        return ResponseEntity.ok(model);
    }

    // ===================== DELETE PRODUCT =====================
    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long productId) {

        String status = productService.deleteProduct(productId);
        return ResponseEntity.ok(status);
    }
}
