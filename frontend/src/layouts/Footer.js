import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-5" style={{ backgroundColor: '#f8f9fa', color: '#444', borderTop: '1px solid #eee' }}>
      <div className="container">
        <div className="row g-4">
          {/* Cột 1: Thương hiệu & Liên hệ */}
          <div className="col-lg-4 col-md-12">
            <h4 className="fw-bold mb-4" style={{ color: '#222' }}>
              Shop<span style={{ color: '#ff6a00' }}>BeAnh</span>
            </h4>
            <p className="small mb-4 text-muted" style={{ lineHeight: '1.8' }}>
              Chúng tôi cung cấp những sản phẩm chất lượng nhất với trải nghiệm mua sắm tuyệt vời. 
              Sự hài lòng của bạn là niềm tự hào của chúng tôi.
            </p>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-map-marker-alt me-3" style={{ color: '#ff6a00' }}></i>
                <span className="small">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-phone-alt me-3" style={{ color: '#ff6a00' }}></i>
                <span className="small">0123 456 789</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-envelope me-3" style={{ color: '#ff6a00' }}></i>
                <span className="small">hotro@shopbeanh.com</span>
              </li>
            </ul>
          </div>

          {/* Cột 2: Thông tin */}
          <div className="col-lg-2 col-6 col-md-4">
            <h6 className="fw-bold mb-4 text-uppercase" style={{ color: '#222', fontSize: '14px' }}>Thông tin</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/career">Tuyển dụng</Link></li>
              <li><Link to="/store">Hệ thống cửa hàng</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Tài khoản */}
          <div className="col-lg-2 col-6 col-md-4">
            <h6 className="fw-bold mb-4 text-uppercase" style={{ color: '#222', fontSize: '14px' }}>Tài khoản</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/profile">Thông tin cá nhân</Link></li>
              <li><Link to="/orders">Lịch sử đơn hàng</Link></li>
              <li><Link to="/cart">Giỏ hàng</Link></li>
              <li><Link to="/wishlist">Sản phẩm yêu thích</Link></li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký bản tin */}
          <div className="col-lg-4 col-md-4 col-12">
            <h6 className="fw-bold mb-4 text-uppercase" style={{ color: '#222', fontSize: '14px' }}>Đăng ký nhận tin</h6>
            <p className="small text-muted mb-3">Nhận ngay thông báo về các chương trình khuyến mãi mới nhất.</p>
            <form className="mb-4">
              <div className="input-group shadow-sm" style={{ borderRadius: '50px', overflow: 'hidden' }}>
                <input 
                  type="email" 
                  className="form-control border-0 px-4" 
                  placeholder="Email của bạn..."
                  style={{ backgroundColor: '#fff', fontSize: '14px' }}
                />
                <button 
                  className="btn btn-warning px-4 fw-bold" 
                  type="button"
                  style={{ backgroundColor: '#ff6a00', border: 'none', color: '#fff' }}
                >
                  GỬI
                </button>
              </div>
            </form>
            <div className="d-flex gap-3 social-icons">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-tiktok"></i></a>
              <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>

        <hr className="my-5" style={{ borderColor: '#ddd' }} />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small mb-0 text-muted">
              &copy; {new Date().getFullYear()} <strong>ShopBeAnh</strong>. Tất cả quyền được bảo lưu.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0 opacity-75">
            <img src="https://img.icons8.com/color/48/000000/visa.png" width="30" className="me-2" alt="visa" />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" width="30" className="me-2" alt="master" />
            <img src="https://img.icons8.com/color/48/000000/paypal.png" width="30" alt="paypal" />
          </div>
        </div>
      </div>

      <style>{`
        .footer-links li { margin-bottom: 12px; }
        .footer-links a { 
          color: #666; 
          text-decoration: none; 
          font-size: 14px; 
          transition: 0.3s; 
        }
        .footer-links a:hover { 
          color: #ff6a00; 
          padding-left: 5px; 
        }
        .social-link {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee;
          color: #555;
          border-radius: 50%;
          text-decoration: none;
          transition: 0.3s;
        }
        .social-link:hover {
          background: #ff6a00;
          transform: translateY(-3px);
          color: #fff;
        }
        .form-control:focus {
          box-shadow: none;
        }
      `}</style>
    </footer>
  );
};

export default Footer;