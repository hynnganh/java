import React, { useState, useEffect } from 'react';
import ReactStars from 'react-stars';
import api from '../../services/api'; // Dùng instance api để tự động gắn Token
import Swal from 'sweetalert2';

const ProductReview = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [averageRating, setAverageRating] = useState(0);

  // Endpoint base đã có /api từ api.js nên chỉ cần /reviews
  const REVIEW_PATH = "/reviews";

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchAverageRating();
      checkReviewPermission();
    }
  }, [productId, currentUser]);

  // 1. Lấy danh sách đánh giá: GET /api/reviews/product/{productId}
  const fetchReviews = async () => {
    try {
      const res = await api.get(`${REVIEW_PATH}/product/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách review:", err);
    }
  };

  // 2. Lấy điểm trung bình: GET /api/reviews/product/{productId}/average
  const fetchAverageRating = async () => {
    try {
      const res = await api.get(`${REVIEW_PATH}/product/${productId}/average`);
      setAverageRating(res.data || 0);
    } catch (err) {
      console.error("Lỗi lấy điểm trung bình:", err);
    }
  };

  // 3. Kiểm tra quyền đánh giá: GET /api/reviews/public/can-review
  const checkReviewPermission = async () => {
    if (currentUser?.userId) {
      try {
        const res = await api.get(`${REVIEW_PATH}/public/can-review`, {
          params: { userId: currentUser.userId, productId: productId }
        });
        setCanReview(res.data);
      } catch (err) {
        console.error("Lỗi kiểm tra quyền:", err);
        setCanReview(false);
      }
    }
  };

  // 4. Gửi đánh giá mới: POST /api/reviews/add
  const handleSubmit = async () => {
    if (!comment.trim()) {
      Swal.fire('Thông báo', 'Vui lòng nhập nội dung đánh giá!', 'warning');
      return;
    }

    const reviewDTO = {
      comment: comment,
      rating: rating,
      productId: productId,
      userId: currentUser.userId,
      userName: currentUser.name || currentUser.userName 
    };

    try {
      const res = await api.post(`${REVIEW_PATH}/add`, reviewDTO);
      
      // Cập nhật giao diện sau khi gửi thành công
      setReviews([res.data, ...reviews]);
      setComment("");
      setCanReview(false); // Ẩn form sau khi đánh giá xong
      fetchAverageRating(); // Cập nhật lại số sao tổng quát

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cảm ơn bạn đã đóng góp ý kiến!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      const errorMsg = err.response?.status === 401 
        ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!" 
        : "Không thể gửi đánh giá. Vui lòng thử lại!";
      Swal.fire('Thất bại', errorMsg, 'error');
    }
  };

  return (
    <div className="product-review-section mt-5 border-top pt-5 pb-5">
      <div className="row g-4 mb-5">
        {/* KHỐI TỔNG QUAN ĐIỂM SỐ */}
        <div className="col-lg-4 text-center border-end">
          <div className="p-3">
            <h1 className="display-3 fw-bold text-dark mb-0">
              {Number(averageRating).toFixed(1)}
            </h1>
            <div className="d-flex justify-content-center mb-2">
              <ReactStars count={5} size={35} value={parseFloat(averageRating)} edit={false} color2={'#ffc107'} />
            </div>
            <p className="text-muted fw-medium fs-6">{reviews.length} đánh giá từ người mua</p>
          </div>
        </div>

        {/* KHỐI FORM VIẾT ĐÁNH GIÁ */}
        <div className="col-lg-8 ps-lg-5">
          {canReview ? (
            <div className="write-review-card p-4 rounded-4 shadow-sm bg-white border">
              <h5 className="fw-bold mb-3">Chia sẻ trải nghiệm của bạn</h5>
              <div className="d-flex align-items-center gap-3 mb-3 p-2 px-3 bg-light rounded-pill w-fit border">
                <span className="small fw-bold text-secondary">Hài lòng:</span>
                <ReactStars count={5} size={25} value={rating} onChange={(r) => setRating(r)} color2={'#ffc107'} />
              </div>
              <textarea 
                className="form-control border-light bg-light shadow-none rounded-4 p-3" 
                rows="3" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy cho chúng tôi biết cảm nhận của bạn về sản phẩm..."
              ></textarea>
              <div className="text-end mt-3">
                <button className="btn btn-dark px-5 py-2 rounded-pill fw-bold btn-hover" onClick={handleSubmit}>
                  Gửi đánh giá ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4 rounded-4 border-dashed bg-light">
              <i className="bi bi-chat-heart text-muted display-6 mb-3"></i>
              <p className="text-muted text-center mb-0 small px-4">
                {currentUser 
                  ? "Bạn chỉ có thể đánh giá sau khi đơn hàng được giao thành công." 
                  : "Vui lòng đăng nhập để tham gia đánh giá sản phẩm."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DANH SÁCH NHẬN XÉT CHI TIẾT */}
      <div className="review-list mt-5">
        <h5 className="fw-bold mb-4 d-flex align-items-center">
          <span className="bg-primary p-1 me-2 rounded-2" style={{width: '6px', height: '20px'}}></span>
          BÌNH LUẬN CHI TIẾT
        </h5>
        
        {reviews.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {reviews.map((r) => (
              <div key={r.reviewId} className="review-item-card p-4 bg-white border-bottom hover-bg transition">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle">{r.userName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">{r.userName}</h6>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <ReactStars count={5} size={14} edit={false} value={r.rating} color2={'#ffc107'} />
                        <span className="verified-badge">Đã mua hàng</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-muted x-small font-monospace">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="mt-3 ps-5 text-secondary fs-6" style={{lineHeight: '1.7'}}>
                  {r.comment}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 rounded-4 bg-light border-dashed">
            <p className="text-muted mb-0 italic">Hiện chưa có đánh giá nào cho sản phẩm này.</p>
          </div>
        )}
      </div>

      <style>{`
        .w-fit { width: fit-content; }
        .border-dashed { border: 2px dashed #dee2e6; }
        .x-small { font-size: 0.7rem; }
        .avatar-circle {
          width: 44px; height: 44px; background: #e9ecef;
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; font-weight: 800; color: #495057;
          border: 1px solid #dee2e6;
        }
        .verified-badge {
          font-size: 0.6rem; font-weight: 700; color: #198754;
          background: #e6f7ef; padding: 2px 8px; border-radius: 4px;
          text-transform: uppercase; border: 1px solid #d1f2e1;
        }
        .btn-hover:hover { opacity: 0.85; transform: scale(1.02); }
        .transition { transition: all 0.3s ease; }
        .hover-bg:hover { background-color: #fafafa; }
      `}</style>
    </div>
  );
};

export default ProductReview;