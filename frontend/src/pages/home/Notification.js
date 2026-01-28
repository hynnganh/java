import React from 'react';
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const navigate = useNavigate();

  return (
    <section className="container my-5">
      <div 
        className="notification-banner position-relative overflow-hidden p-4 p-md-5 rounded-4 shadow-lg border-0 text-white"
        style={{
          background: 'linear-gradient(135deg, #ff6a00 0%, #ffc107 100%)',
        }}
      >
        {/* Decor Icons (Icon ẩn làm nền cho xịn) */}
        <div className="position-absolute end-0 top-0 opacity-25 translate-middle-y mt-5 me-n4">
          <i className="fas fa-tags" style={{ fontSize: '150px', transform: 'rotate(-20deg)' }}></i>
        </div>

        <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
          {/* Nội dung */}
          <div className="col-md-8 text-center text-md-start mb-4 mb-md-0">
            <h2 className="fw-bold mb-2 display-6">
              <i className="fas fa-sparkles me-2"></i> 
              Săn Deal Xịn - Đón Tết Vui!
            </h2>
            <p className="fs-5 mb-0 opacity-90">
              Giảm ngay <strong className="text-dark">50%</strong> cho các mặt hàng thời trang hot nhất tuần này. Miễn phí vận chuyển toàn quốc.
            </p>
          </div>

          {/* Nút bấm */}
          <div className="col-md-4 text-center text-md-end">
            <button 
              onClick={() => navigate('/product')}
              className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-orange-main shadow transition-hover"
              style={{ color: '#ff6a00' }}
            >
              KHÁM PHÁ NGAY
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .text-orange-main { color: #ff6a00 !important; }
        .notification-banner { transition: transform 0.3s ease; }
        .notification-banner:hover { transform: translateY(-5px); }
        .transition-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }
        @media (max-width: 768px) {
          .notification-banner { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
};

export default Notification;