import React, { useState, useEffect } from 'react';
import ReactStars from 'react-stars';
import axios from 'axios';
import Swal from 'sweetalert2';

const ProductReview = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchReviews();
    checkReviewPermission();
  }, [productId, currentUser]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/public/products/${productId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi lấy đánh giá:", err);
    }
  };

  const checkReviewPermission = async () => {
    if (currentUser?.userId) {
      try {
        const res = await axios.get(`http://localhost:8080/api/public/can-review`, {
          params: { userId: currentUser.userId, productId: productId }
        });
        setCanReview(res.data);
      } catch (err) {
        setCanReview(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Swal.fire({ icon: 'warning', title: 'Thông báo', text: 'Vui lòng nhập nội dung đánh giá!', confirmButtonColor: '#0d6efd' });
      return;
    }

    try {
      const reviewDTO = { comment, rating, productId, userId: currentUser.userId };
      const res = await axios.post(`http://localhost:8080/api/admin/reviews`, reviewDTO);
      setReviews([res.data, ...reviews]);
      setComment("");
      setCanReview(false);
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Cảm ơn đóng góp của bạn!', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể gửi đánh giá, vui lòng thử lại sau!', 'error');
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="review-section mt-5 pt-5 pb-5">
      {/* Header Section */}
      <div className="d-flex align-items-center mb-4">
        <div className="review-dot me-2"></div>
        <h4 className="fw-bold text-dark mb-0 ls-1">ĐÁNH GIÁ SẢN PHẨM</h4>
      </div>

      <div className="row g-4">
        {/* TỔNG QUAN ĐIỂM SỐ */}
        <div className="col-lg-4">
          <div className="rating-summary-card h-100 p-4 text-center d-flex flex-column justify-content-center shadow-sm border-0 bg-white">
            <h1 className="rating-number mb-0">{avgRating}</h1>
            <div className="d-flex justify-content-center my-2">
              <ReactStars count={5} size={35} value={parseFloat(avgRating)} edit={false} color2={'#ffc107'} />
            </div>
            <p className="text-muted fw-medium">{reviews.length} nhận xét</p>
          </div>
        </div>

        {/* FORM GỬI ĐÁNH GIÁ */}
        <div className="col-lg-8">
          {canReview ? (
            <div className="write-review-card p-4 h-100 shadow-sm bg-white border-0">
              <h5 className="fw-bold mb-3">Gửi đánh giá của bạn</h5>
              <div className="rating-input-group mb-3 d-flex align-items-center gap-3 p-2 px-3 rounded-pill bg-light w-fit">
                <span className="small fw-bold text-secondary">Độ hài lòng:</span>
                <ReactStars count={5} size={25} value={rating} onChange={(newRating) => setRating(newRating)} color2={'#ffc107'} />
              </div>
              <textarea 
                className="form-control review-textarea shadow-none border-light bg-light" 
                rows="3" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Sản phẩm tuyệt vời, tôi rất thích..."
              ></textarea>
              <div className="text-end mt-3">
                <button className="btn btn-dark px-4 py-2 rounded-pill fw-bold btn-hover-scale" onClick={handleSubmit}>
                  Gửi đánh giá ngay <i className="bi bi-send-fill ms-2"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="no-review-access p-4 h-100 rounded-4 d-flex align-items-center justify-content-center text-center bg-light border-dashed">
              <div className="px-3">
                <i className="bi bi-shield-lock h2 text-muted mb-3 d-block"></i>
                <h6 className="fw-bold text-dark">Quyền đánh giá bị giới hạn</h6>
                <p className="small text-muted mb-0">Bạn cần hoàn tất đơn hàng và nhận sản phẩm để có thể viết đánh giá tại đây.</p>
              </div>
            </div>
          )}
        </div>

        {/* DANH SÁCH CÁC REVIEW */}
        <div className="col-12 mt-5">
          <div className="review-list d-flex flex-column gap-3">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.reviewId} className="review-item-card p-4 transition-all bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <div className="review-avatar-box me-3">
                        {r.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{r.userName}</h6>
                        <div className="d-flex align-items-center gap-2">
                          <ReactStars count={5} size={14} edit={false} value={r.rating} color2={'#ffc107'} />
                          <span className="verified-badge">
                             <i className="bi bi-check-circle-fill me-1"></i> Đã mua hàng
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="review-comment-body mt-3">
                    {r.comment}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 border rounded-4 bg-light">
                <i className="bi bi-chat-left-dots h1 text-muted opacity-25"></i>
                <p className="text-muted mt-2 mb-0">Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .w-fit { width: fit-content; }
        .border-dashed { border: 2px dashed #dee2e6; }
        
        .review-dot { width: 12px; height: 12px; background: #000; border-radius: 3px; }
        
        .rating-summary-card { border-radius: 20px; }
        .rating-number { font-size: 4rem; font-weight: 800; color: #1a1a1a; }
        
        .write-review-card { border-radius: 20px; }
        .review-textarea { border-radius: 15px; padding: 15px; border: 1px solid #eee; }
        .review-textarea:focus { background: #fff; border-color: #000; }

        .review-item-card { border-radius: 0; border: none; }
        .review-item-card:hover { background-color: #fafafa; }

        .review-avatar-box {
          width: 48px; height: 48px; 
          background: #f0f0f0; color: #555;
          border-radius: 12px; display: flex;
          align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.1rem;
          border: 1px solid #eee;
        }

        .verified-badge {
          background: #e6f7ef; color: #198754;
          font-size: 0.65rem; font-weight: 700;
          padding: 2px 8px; border-radius: 4px;
          text-transform: uppercase;
        }

        .review-date { font-size: 0.75rem; color: #aaa; font-weight: 500; }
        .review-comment-body { color: #444; line-height: 1.6; font-size: 0.95rem; }

        .btn-hover-scale { transition: all 0.2s; }
        .btn-hover-scale:hover { transform: scale(1.03); opacity: 0.9; }

        .transition-all { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
};

export default ProductReview;