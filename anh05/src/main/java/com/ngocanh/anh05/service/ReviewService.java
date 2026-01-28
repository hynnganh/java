package com.ngocanh.anh05.service;

import java.util.List;
import com.ngocanh.anh05.payloads.ReviewDTO;

/**
 * Interface định nghĩa các nghiệp vụ cho chức năng Đánh giá sản phẩm (Reviews).
 * Đây là chức năng nâng cao giúp tăng tương tác và uy tín cho cửa hàng mỹ phẩm.
 */
public interface ReviewService {

    /**
     * Thêm một đánh giá mới cho sản phẩm.
     * @param reviewDTO Chứa thông tin rating, comment, userId và productId.
     * @return ReviewDTO sau khi đã lưu thành công vào cơ sở dữ liệu.
     */
    ReviewDTO addReview(ReviewDTO reviewDTO);

    /**
     * Lấy danh sách tất cả đánh giá của một sản phẩm dựa trên ID.
     * @param productId ID của sản phẩm cần xem đánh giá.
     * @return Danh sách các DTO chứa nội dung đánh giá và tên khách hàng.
     */
    List<ReviewDTO> getReviewsByProductId(Long productId);

    /**
     * Tính toán số sao trung bình của một sản phẩm.
     * @param productId ID của sản phẩm.
     * @return Giá trị trung bình (Ví dụ: 4.5). Trả về 0.0 nếu chưa có ai đánh giá.
     */
    Double getAverageRating(Long productId);

    /**
     * Xóa một đánh giá cụ thể. 
     * Thường dùng cho Admin để quản lý nội dung xấu hoặc khách muốn thu hồi đánh giá.
     * @param reviewId ID của bản ghi đánh giá cần xóa.
     */
    void deleteReview(Long reviewId);

    boolean canUserReview(Long userId, Long productId);
}
