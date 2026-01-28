import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import userService from "../../services/userService";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* 1. GỌI API LOGIN */
      const res = await authService.login(formData);
      const loginData = res.data;
      const token = loginData.token || loginData["jwt-token"] || loginData.jwt;

      if (!token) throw new Error("Server không trả về token");

      /* 2. LƯU CHÌA KHÓA RIÊNG CỦA USER */
      localStorage.setItem("token", token); // Key này chỉ dành cho khách hàng

      /* 3. LẤY THÔNG TIN NGƯỜI DÙNG */
      let userInfo = null;
      try {
        userInfo = await userService.getUserByEmail(formData.email);
      } catch (err) {
        console.warn("Không lấy được profile chi tiết, dùng fallback.");
      }

      const userToStore = {
        userId: userInfo?.userId || userInfo?.id || "N/A",
        email: formData.email,
        firstName: userInfo?.firstName || "Khách hàng",
      };

      localStorage.setItem("user", JSON.stringify(userToStore));

      /* 4. CẬP NHẬT TRẠNG THÁI TOÀN CỤC */
      window.dispatchEvent(new Event("authUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));

      /* 5. THÔNG BÁO & ĐIỀU HƯỚNG THẲNG VỀ TRANG CHỦ */
      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        text: `Chào mừng bạn quay lại, ${userToStore.firstName}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/"); // LUÔN LUÔN về trang chủ, không xét quyền admin ở đây

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: err.response?.data?.message || "Email hoặc mật khẩu không đúng",
        confirmButtonColor: "#ff6a00",
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
              <div className="p-4 text-center text-white" style={{ backgroundColor: "#ff6a00", borderRadius: "15px 15px 0 0" }}>
                <h3 className="fw-bold mb-1">Cửa Hàng Mỹ Phẩm</h3>
                <p className="mb-0 opacity-75 small">Đăng nhập để mua sắm ngay</p>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <input name="email" type="email" className="form-control" onChange={handleChange} required disabled={loading} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Mật khẩu</label>
                    <input name="password" type="password" className="form-control" onChange={handleChange} required disabled={loading} />
                  </div>

                  <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: "#ff6a00" }} disabled={loading}>
                    {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
                  </button>

                  <div className="text-center mt-3">
                    <p className="mb-0 text-muted small">Chưa có tài khoản? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: "#ff6a00" }}>Đăng ký</Link></p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;