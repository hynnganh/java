package com.ngocanh.anh05.payloads;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Annotation này của Lombok sẽ tự tạo hàm setUserName cho mày
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long reviewId;
    private String comment;
    private int rating;
    private LocalDateTime createdAt;
    private Long productId;
    private Long userId;
    
    // Đảm bảo tên biến y hệt như này:
    private String userName; 
}