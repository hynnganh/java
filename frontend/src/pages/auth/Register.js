import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    password: "",
    confirmPassword: "",
    street: "Default Street",
    buildingName: "Building A",
    city: "Hanoi",
    state: "HN",
    country: "VN",
    pincode: "100000",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (backendErrors[e.target.name]) {
      setBackendErrors({ ...backendErrors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});

    if (form.password !== form.confirmPassword) {
      setBackendErrors({ confirmPassword: "Mật khẩu nhập lại không khớp!" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.first_name,
        lastName: form.last_name,
        mobileNumber: form.mobile_number,
        email: form.email,
        password: form.password,
        address: {
          street: form.street,
          buildingName: form.buildingName,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
        },
        role: [{ roleId: 102, roleName: "USER" }],
      };

      await authService.register(payload);

      Swal.fire({
        title: "Đăng ký thành công!",
        text: "Chào mừng bạn gia nhập gia đình Bé Ánh.",
        icon: "success",
        confirmButtonColor: "#ff6a00",
      }).then(() => navigate("/login"));

    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 400 && typeof errorData === "object") {
        // Map lỗi từ Backend (CamelCase) sang Frontend (SnakeCase)
        setBackendErrors({
          first_name: errorData.firstName,
          last_name: errorData.lastName,
          email: errorData.email,
          mobile_number: errorData.mobileNumber,
          password: errorData.password
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text: typeof errorData === "string" ? errorData : "Email hoặc số điện thoại đã tồn tại!",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-content padding-y bg-light" style={{ minHeight: "90vh" }}>
      <div className="card mx-auto shadow-sm" style={{ maxWidth: "520px", marginTop: "40px", borderRadius: "15px" }}>
        <article className="card-body p-4">
          <header className="mb-4 text-center">
            <h4 className="card-title fw-bold" style={{ color: "#ff6a00" }}>TẠO TÀI KHOẢN</h4>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="small fw-bold">Họ</label>
                <input name="first_name" type="text" className={`form-control ${backendErrors.first_name ? 'is-invalid' : ''}`} value={form.first_name} onChange={handleChange} required />
                <div className="invalid-feedback">{backendErrors.first_name}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="small fw-bold">Tên</label>
                <input name="last_name" type="text" className={`form-control ${backendErrors.last_name ? 'is-invalid' : ''}`} value={form.last_name} onChange={handleChange} required />
                <div className="invalid-feedback">{backendErrors.last_name}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold">Email</label>
              <input name="email" type="email" className={`form-control ${backendErrors.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleChange} required />
              <div className="invalid-feedback">{backendErrors.email}</div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold">Số điện thoại</label>
              <input name="mobile_number" type="text" className={`form-control ${backendErrors.mobile_number ? 'is-invalid' : ''}`} value={form.mobile_number} onChange={handleChange} required />
              <div className="invalid-feedback">{backendErrors.mobile_number}</div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label className="small fw-bold">Mật khẩu</label>
                <input name="password" type="password" className={`form-control ${backendErrors.password ? 'is-invalid' : ''}`} value={form.password} onChange={handleChange} required />
                <div className="invalid-feedback">{backendErrors.password}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="small fw-bold">Nhập lại</label>
                <input name="confirmPassword" type="password" className={`form-control ${backendErrors.confirmPassword ? 'is-invalid' : ''}`} value={form.confirmPassword} onChange={handleChange} required />
                <div className="invalid-feedback">{backendErrors.confirmPassword}</div>
              </div>
            </div>

            <button type="submit" className="btn w-100 fw-bold text-white" style={{ backgroundColor: "#ff6a00" }} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : "ĐĂNG KÝ NGAY"}
            </button>
            <p className="text-center mt-3 mb-0">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-decoration-none fw-bold" style={{ color: "#ff6a00" }}>
                Đăng nhập
              </Link>
            </p>
          </form>
        </article>
      </div>
    </section>
  );
};

export default Register;