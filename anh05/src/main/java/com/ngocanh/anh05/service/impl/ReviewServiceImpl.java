package com.ngocanh.anh05.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ngocanh.anh05.entity.Review;
import com.ngocanh.anh05.entity.User;
import com.ngocanh.anh05.entity.Product;
import com.ngocanh.anh05.exceptions.APIException;
import com.ngocanh.anh05.exceptions.ResourceNotFoundException;
import com.ngocanh.anh05.repository.ReviewRepo;
import com.ngocanh.anh05.repository.OrderRepo;
import com.ngocanh.anh05.repository.ProductRepo;
import com.ngocanh.anh05.repository.UserRepo;
import com.ngocanh.anh05.payloads.ReviewDTO;
import com.ngocanh.anh05.service.ReviewService;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepo reviewRepository;

    @Autowired
    private OrderRepo orderRepository;

    @Autowired
    private ProductRepo productRepository;
    
    @Autowired
    private UserRepo userRepository;

    @Override
    @Transactional
    public ReviewDTO addReview(ReviewDTO reviewDTO) {
        // 1. Tìm thông tin User
        User user = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", reviewDTO.getUserId()));

        // 2. Check quyền mua hàng dựa trên EMAIL (Vì Entity Order của mày dùng email)
        boolean hasPurchased = orderRepository.existsByEmailAndOrderStatusAndOrderItemsProductProductId(
                user.getEmail(), "DELIVERED", reviewDTO.getProductId());

        if (!hasPurchased) {
            throw new APIException("Bạn phải mua sản phẩm này và nhận hàng thành công mới được đánh giá!");
        }
        
        // 3. Kiểm tra xem đã đánh giá sản phẩm này chưa để tránh spam
        if (reviewRepository.existsByUser_UserIdAndProduct_ProductId(reviewDTO.getUserId(), reviewDTO.getProductId())) {
            throw new APIException("Mỗi sản phẩm bạn chỉ được đánh giá một lần!");
        }

        // 4. Lấy thực thể Product
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", reviewDTO.getProductId()));

        // 5. Map DTO sang Entity và lưu
        Review review = new Review();
        review.setComment(reviewDTO.getComment());
        review.setRating(reviewDTO.getRating());
        review.setUser(user);
        review.setProduct(product);

        Review savedReview = reviewRepository.save(review);

        return mapToDTO(savedReview);
    }

    @Override
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductProductId(productId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductProductId(productId);
        return reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
    }

    @Override
    public void deleteReview(Long reviewId) {
        if(!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review", "reviewId", reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    @Override
    public boolean canUserReview(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        // Trả về kết quả kiểm tra từ OrderRepo
        return orderRepository.existsByEmailAndOrderStatusAndOrderItemsProductProductId(
                user.getEmail(), "DELIVERED", productId);
    }

    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setComment(review.getComment());
        dto.setRating(review.getRating());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setProductId(review.getProduct().getProductId());
        dto.setUserId(review.getUser().getUserId());
        dto.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        return dto;
    }
}