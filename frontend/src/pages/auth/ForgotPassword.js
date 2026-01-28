import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  sendOtpApi,
  verifyOtpApi,
  resetPasswordApi,
} from "../../services/forgotPasswordApi";


const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1-email | 2-otp | 3-new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 STEP 1: GỬI OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendOtpApi(email);

      Swal.fire({
        icon: "success",
        title: "Đã gửi OTP 📩",
        text: "Vui lòng kiểm tra email của bạn",
      });

      setStep(2);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Không gửi được OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟡 STEP 2: XÁC NHẬN OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyOtpApi(email, otp);

      Swal.fire({
        icon: "success",
        title: "OTP hợp lệ ✅",
        text: "Nhập mật khẩu mới nhé!",
      });

      setStep(3);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sai OTP",
        text: "Mã xác nhận không đúng hoặc đã hết hạn",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔵 STEP 3: ĐỔI MẬT KHẨU
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPasswordApi(email, newPassword);

      Swal.fire({
        icon: "success",
        title: "Thành công 🎉",
        text: "Mật khẩu đã được cập nhật",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Không thể đổi mật khẩu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-3">Quên mật khẩu 🔐</h3>

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Nhập mã OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Đang xác nhận..." : "Xác nhận OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Mật khẩu mới"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="btn btn-warning w-100" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
