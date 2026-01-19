import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import Swal from "sweetalert2";

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
    const init = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        Swal.fire("Thông báo", "Vui lòng đăng nhập!", "warning");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);
      setUserId(user.userId);
      setLoading(true);

      try {
        const profile = await userService.getUserById(user.userId);
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          mobileNumber: profile.mobileNumber || "",
        });
      } catch (err) {
        // fallback dùng localStorage nếu API lỗi
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      Swal.fire("Lỗi", "Họ và tên không được để trống", "error");
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber,
        // ❌ KHÔNG gửi email
      };

      await userService.updateUser(userId, updateData);

      // cập nhật lại localStorage (GIỮ NGUYÊN EMAIL)
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...currentUser,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        mobileNumber: updateData.mobileNumber,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      await Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật hồ sơ thành công!",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (error) {
      Swal.fire(
        "Lỗi",
        error.response?.data?.message || "Không thể cập nhật thông tin",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-light" style={{ minHeight: "90vh" }}>
      <div className="container">
        <div className="card mx-auto shadow-sm border-0" style={{ maxWidth: 600, marginTop: 40 }}>
          <div className="card-body p-5">
            <h3 className="fw-bold mb-3">Chỉnh sửa hồ sơ</h3>
            <p className="text-muted small mb-4">
              Email không thể thay đổi sau khi đăng ký
            </p>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control form-control-lg bg-light border-0"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control form-control-lg bg-light border-0"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {/* EMAIL – CHỈ XEM */}
              <div className="mb-3">
                <label className="form-label fw-bold small">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg bg-light border-0"
                  value={form.email}
                  readOnly
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small">Số điện thoại</label>
                <input
                  type="text"
                  name="mobileNumber"
                  className="form-control form-control-lg bg-light border-0"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg fw-bold"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>

                <button
                  type="button"
                  className="btn btn-link text-muted"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-muted text-decoration-none small">
            ← Quay về trang chủ
          </Link>
        </p>
      </div>
    </section>
  );
};

export default EditProfile;
