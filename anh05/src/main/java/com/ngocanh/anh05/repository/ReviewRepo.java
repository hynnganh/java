package com.ngocanh.anh05.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ngocanh.anh05.entity.Review;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {

    // 1. Tìm tất cả review của một sản phẩm, sắp xếp cái mới nhất lên đầu
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Long productId);
    
    List<Review> findByProductProductId(Long productId);
    // 2. Kiểm tra xem một User đã đánh giá sản phẩm này chưa (Tránh spam)
    boolean existsByUser_UserIdAndProduct_ProductId(Long userId, Long productId);

    // 3. Đếm tổng số lượng đánh giá của một sản phẩm
    long countByProductProductId(Long productId);

    // 4. (Nâng cao) Tính trung bình cộng số sao bằng Query trực tiếp trong DB
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRating(@Param("productId") Long productId);
}
