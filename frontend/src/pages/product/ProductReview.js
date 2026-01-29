import React, { useState, useEffect } from 'react';
import ReactStars from 'react-stars';
import api from '../../services/api'; 
import Swal from 'sweetalert2';

const ProductReview = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const REVIEW_PATH = "/reviews";

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchAverageRating();
    }
  }, [productId]);

  // Tách biệt useEffect để check quyền khi currentUser đã load xong
  useEffect(() => {
    if (productId && currentUser?.userId) {
      checkReviewPermission();
    } else {
      setCanReview(false);
    }
  }, [productId, currentUser, reviews]); // Check lại khi danh sách reviews thay đổi

  // 1. Lấy danh sách đánh giá
  const fetchReviews = async () => {
    try {
      const res = await api.get(`${REVIEW_PATH}/product/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi fetch reviews:", err);
    }
  };

  // 2. Lấy điểm trung bình
  const fetchAverageRating = async () => {
    try {
      const res = await api.get(`${REVIEW_PATH}/product/${productId}/average`);
      setAverageRating(res.data || 0);
    } catch (err) {
      console.error("Lỗi fetch average rating:", err);
    }
  };

  // 3. Kiểm tra quyền (Khớp với canUserReview trong Service của nàng)
  const checkReviewPermission = async () => {
    try {
      // Đầu tiên: Check xem user này đã nằm trong danh sách reviews chưa (Chặn đánh giá 2 lần)
      const alreadyReviewed = reviews.some(r => r.userId === currentUser.userId);
      
      if (alreadyReviewed) {
        setCanReview(false);
        return;
      }

      // Thứ hai: Gọi API Backend check xem đã mua hàng DELIVERED chưa
      const res = await api.get(`${REVIEW_PATH}/public/can-review`, {
        params: { userId: currentUser.userId, productId: productId }
      });
      setCanReview(res.data);
    } catch (err) {
      setCanReview(false);
    }
  };

  // 4. Gửi đánh giá
  const handleSubmit = async () => {
    if (!comment.trim()) {
      Swal.fire('Thông báo', 'Nàng viết vài dòng cảm nhận đã nhé!', 'warning');
      return;
    }

    setLoading(true);
    const reviewDTO = {
      comment: comment,
      rating: rating,
      productId: productId,
      userId: currentUser.userId
    };

    try {
      const res = await api.post(`${REVIEW_PATH}/add`, reviewDTO);
      
      // Update UI ngay lập tức
      setReviews([res.data, ...reviews]);
      setComment("");
      setCanReview(false); // Đánh giá xong là khóa luôn form
      fetchAverageRating();

      Swal.fire({
        icon: 'success',
        title: 'Xong luôn!',
        text: 'Cảm ơn nàng đã ủng hộ shop nhé! ❤️',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      // Bắt lỗi 400 từ APIException của nàng
      const errorMsg = err.response?.data?.message || "Lỗi rồi, thử lại sau nàng nha!";
      Swal.fire('Hic!', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-review-section mt-5 border-top pt-5">
      <div className="row g-4 mb-5">
        {/* BÊN TRÁI: ĐIỂM SỐ */}
        <div className="col-lg-4 text-center border-end">
          <div className="p-3">
            <h1 className="display-4 fw-bold text-warning mb-0">
              {Number(averageRating).toFixed(1)}
            </h1>
            <div className="d-flex justify-content-center my-2">
              <ReactStars count={5} size={30} value={parseFloat(averageRating)} edit={false} color2={'#ffc107'} />
            </div>
            <p className="text-muted small">{reviews.length} khách hàng đã tin dùng</p>
          </div>
        </div>

        {/* BÊN PHẢI: FORM HOẶC THÔNG BÁO */}
        <div className="col-lg-8 ps-lg-5">
          {canReview ? (
            <div className="review-form-box p-4 rounded-4 shadow-sm bg-white border border-warning">
              <h6 className="fw-bold mb-3 text-uppercase">Gửi đánh giá của nàng</h6>
              <div className="mb-3 d-flex align-items-center gap-2">
                <span className="small text-muted">Nàng thấy sản phẩm sao?</span>
                <ReactStars count={5} size={24} value={rating} onChange={(r) => setRating(r)} color2={'#ffc107'} />
              </div>
              <textarea 
                className="form-control border-0 bg-light rounded-3 p-3 shadow-none" 
                rows="3" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nàng chia sẻ trải nghiệm ở đây nhé..."
              ></textarea>
              <div className="text-end mt-3">
                <button className="btn btn-warning text-white fw-bold px-4 py-2 rounded-pill shadow-sm" 
                        onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi ngay'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4 rounded-4 bg-light border border-dashed">
              <i className={`bi ${!currentUser ? 'bi-person-lock' : reviews.some(r => r.userId === currentUser.userId) ? 'bi-check-all text-success' : 'bi-cart-x'} fs-1 text-muted mb-2`}></i>
              <p className="text-muted small text-center mb-0 px-3">
                {!currentUser 
                  ? "Nàng cần đăng nhập để viết đánh giá." 
                  : reviews.some(r => r.userId === currentUser.userId)
                    ? "Nàng đã đánh giá sản phẩm này rồi. Mãi yêu! ❤️"
                    : "Đánh giá chỉ dành cho nàng đã mua và nhận hàng thành công sản phẩm này thôi nè."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DANH SÁCH REVIEW */}
      <div className="mt-5">
        <h6 className="fw-bold mb-4">CÁC PHẢN HỒI KHÁC ({reviews.length})</h6>
        {reviews.length > 0 ? (
          <div className="review-scroll" style={{maxHeight: '500px', overflowY: 'auto'}}>
            {reviews.map((r) => (
              <div key={r.reviewId} className="mb-4 p-3 rounded-3 bg-white border-bottom shadow-sm-hover transition">
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-small">{r.userName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <span className="fw-bold d-block small">{r.userName}</span>
                      <ReactStars count={5} size={12} value={r.rating} edit={false} color2={'#ffc107'} />
                    </div>
                  </div>
                  <span className="text-muted x-small italic">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="mt-2 mb-0 small text-secondary ps-5">"{r.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted small italic">Sản phẩm chưa có đánh giá nào nàng ơi...</div>
        )}
      </div>

      <style>{`
        .avatar-small { width: 35px; height: 35px; background: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #856404; font-size: 14px; }
        .x-small { font-size: 11px; }
        .border-dashed { border: 2px dashed #ddd !important; }
        .shadow-sm-hover:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .transition { transition: all 0.3s ease; }
        .review-scroll::-webkit-scrollbar { width: 5px; }
        .review-scroll::-webkit-scrollbar-thumb { background: #ffc107; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ProductReview;