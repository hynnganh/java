package com.ngocanh.anh05.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.ngocanh.anh05.entity.Review;
import com.ngocanh.anh05.service.ReviewService;
import com.ngocanh.anh05.payloads.ReviewDTO;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*") // Để React call API không bị lỗi CORS
public class ReviewController {

    // Tiêm Interface (Loose Coupling)
    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProduct(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByProductId(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            ReviewDTO savedReview = reviewService.addReview(reviewDTO);
            return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Trả về lỗi nếu chưa mua hàng hoặc dữ liệu sai
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAverageRating(productId));
    }

    @GetMapping("/public/can-review")
public ResponseEntity<Boolean> canReview(@RequestParam Long userId, @RequestParam Long productId) {
    return ResponseEntity.ok(reviewService.canUserReview(userId, productId));
}
}