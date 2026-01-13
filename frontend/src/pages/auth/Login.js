import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import userService from "../../services/userService";
import Swal from "sweetalert2"; // Import SweetAlert2

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Gọi API Login
      const res = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      const loginData = res.data;
      const token = loginData.token || loginData['jwt-token'] || loginData.jwt;
      
      if (!token) throw new Error("Server không trả về mã xác thực (token)");
      
      // Lưu Token
      localStorage.setItem("token", token);

      let userInfo = null;
      let realUserId = null;

      // 2. Lấy thông tin chi tiết User
      try {
        userInfo = await userService.getUserByEmail(formData.email);
        realUserId = userInfo.user_id || userInfo.userId || userInfo.id;
        if (realUserId) realUserId = parseInt(realUserId);
      } catch (err) { 
        console.warn("Không lấy được userInfo từ email, thử parse token..."); 
      }

      // 3. Nếu API lấy User theo Email lỗi, thử giải mã Token để lấy ID
      if (!realUserId) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          realUserId = parseInt(payload.userId || payload.sub || payload.user_id);
        } catch (err) { console.warn(err); }
      }

      if (!realUserId) throw new Error("Không thể xác định danh tính người dùng.");

      // 4. Lưu thông tin User vào LocalStorage
      const userToStore = {
        userId: realUserId,
        email: formData.email,
        firstName: userInfo?.firstName || userInfo?.first_name || "Tài khoản",
        lastName: userInfo?.lastName || userInfo?.last_name || "",
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      
      // ✅ BƯỚC QUAN TRỌNG NHẤT: Bắn sự kiện để Header tự động cập nhật tên
      window.dispatchEvent(new Event("authUpdated")); 
      window.dispatchEvent(new Event("cartUpdated")); // Cập nhật giỏ hàng luôn
      
      // Thông báo thành công
      Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!',
        text: `Chào mừng ${userToStore.firstName} quay trở lại!`,
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/");

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Đăng nhập thất bại',
        text: err.response?.data?.message || err.message || "Email hoặc mật khẩu không đúng",
        confirmButtonColor: '#ff6a00'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
              {/* Header của Card mang phong cách Guardian */}
              <div className="login-header p-4 text-center text-white" style={{ backgroundColor: "#ff6a00", borderRadius: "15px 15px 0 0" }}>
                <h3 className="fw-bold mb-1">Chào mừng!</h3>
                <p className="mb-0 opacity-75 small">Đăng nhập để tiếp tục mua sắm</p>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa fa-envelope text-muted"></i>
                      </span>
                      <input
                        name="email"
                        type="email"
                        className="form-control border-start-0 ps-0 bg-light shadow-none"
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa fa-lock text-muted"></i>
                      </span>
                      <input
                        name="password"
                        type="password"
                        className="form-control border-start-0 ps-0 bg-light shadow-none"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input shadow-none"
                        type="checkbox"
                        id="rememberMe"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                      />
                      <label className="form-check-label small text-muted" htmlFor="rememberMe">
                        Ghi nhớ
                      </label>
                    </div>
                    <Link to="/forgot-password" style={{ color: "#ff6a00" }} className="text-decoration-none small fw-bold">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Nút Đăng nhập */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-3 border-0"
                    style={{ backgroundColor: "#ff6a00" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "ĐĂNG NHẬP"
                    )}
                  </button>

                  {/* Nút Đăng ký */}
                  <div className="text-center mt-3">
                    <p className="mb-0 text-muted small">
                      Bạn chưa có tài khoản?{" "}
                      <Link to="/register" className="fw-bold text-decoration-none" style={{ color: "#ff6a00" }}>
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-muted text-decoration-none small">
                <i className="fa fa-arrow-left me-1"></i> Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;