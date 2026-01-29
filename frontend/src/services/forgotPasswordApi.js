import axios from "axios";

const forgotPasswordApi = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gửi OTP
export const sendOtpApi = (email) =>
  forgotPasswordApi.post("/forgot-password/send-otp", { email });

// Xác nhận OTP
export const verifyOtpApi = (email, otp) =>
  forgotPasswordApi.post("/forgot-password/verify", { email, otp });

// Đặt lại mật khẩu
export const resetPasswordApi = (email, newPassword) =>
  forgotPasswordApi.post("/forgot-password", {
    email,
    newPassword,
  });
