import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import Swal from "sweetalert2"; // Thêm thư viện thông báo

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          Swal.fire("Thông báo", "Vui lòng đăng nhập để tiếp tục!", "warning");
          navigate("/login");
          return false;
        }

        const user = JSON.parse(userData);
        const userId = user.userId;
        setUserId(userId);
        return { token, user, userId };
      } catch (error) {
        return false;
      }
    };

    const loadUserData = async () => {
      const auth = checkAuth();
      if (!auth) return;

      const { user: userData, userId } = auth;
      setLoading(true);

      try {
        if (typeof userId === 'number' && userId >= 0) {
          const userProfile = await userService.getUserById(userId);
          setForm({
            firstName: userProfile.firstName || userData.firstName || "",
            lastName: userProfile.lastName || userData.lastName || "",
            email: userProfile.email || userData.email || "",
            mobileNumber: userProfile.mobileNumber || userData.mobileNumber || ""
          });
        }
      } catch (error) {
        console.error("❌ Failed to load user data:", error);
        // Fallback dùng dữ liệu local nếu API lỗi
        setForm({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          mobileNumber: userData.mobileNumber || ""
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation chuyên nghiệp hơn
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Swal.fire("Lỗi", "Họ và tên không được để trống", "error");
      return;
    }

    setSaving(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const currentUserId = userData.userId;

      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobileNumber: form.mobileNumber
      };

      if (typeof currentUserId === 'number' && currentUserId >= 0) {
        await userService.updateUser(currentUserId, updateData);

        // Cập nhật lại localStorage để các trang khác đồng bộ theo
        const updatedUser = { ...userData, ...updateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Hồ sơ của bạn đã được cập nhật.",
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate(-1);
      } else {
        Swal.fire("Cảnh báo", "Chỉ tài khoản thực mới có thể lưu dữ liệu", "warning");
      }
    } catch (error) {
      Swal.fire("Lỗi", error.response?.data?.message || "Không thể cập nhật thông tin", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="text-center">
          <div className="spinner-grow text-primary" role="status"></div>
          <p className="mt-3 text-muted">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="section-content padding-y bg-light" style={{ minHeight: "90vh" }}>
      <div className="container">
        <div className="card mx-auto shadow-sm border-0" style={{ maxWidth: "600px", marginTop: "40px" }}>
          <div className="card-body p-5">
            <header className="mb-4">
              <h3 className="card-title fw-bold text-dark">Chỉnh sửa hồ sơ</h3>
              <p className="text-muted small">Cập nhật thông tin cá nhân của bạn để nhận dịch vụ tốt nhất.</p>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Họ</label>
                  <input
                    name="firstName"
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="Nhập họ..."
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Tên</label>
                  <input
                    name="lastName"
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="Nhập tên..."
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Địa chỉ Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-control form-control-lg bg-light border-0"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small">Số điện thoại</label>
                <input
                  name="mobileNumber"
                  type="text"
                  className="form-control form-control-lg bg-light border-0"
                  placeholder="Ví dụ: 0987xxxxxx"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg shadow-sm fw-bold" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
                <button type="button" className="btn btn-link text-muted" onClick={() => navigate(-1)} disabled={saving}>
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <p className="text-center mt-4">
          <Link to="/" className="text-decoration-none text-muted small">
            <i className="fas fa-chevron-left me-1"></i> Quay về trang chủ
          </Link>
        </p>
      </div>
    </section>
  );
};

export default EditProfile;