import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import Swal from "sweetalert2";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      const data = res.data;
      const token = data.token || data.jwt || data["jwt-token"];

      if (!token) throw new Error("Không nhận được token từ hệ thống!");

      // 1. GIẢI MÃ TOKEN ĐỂ CHECK ROLE
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const rawRole = payload.roles || payload.authorities || payload.role || payload.sub;
      const roleStr = JSON.stringify(rawRole);

      if (!roleStr.includes("ADMIN")) {
        Swal.fire({
          icon: "error",
          title: "TRUY CẬP BỊ CHẶN",
          text: "Khu vực này chỉ dành cho Quản trị viên!",
          background: "#fff",
          confirmButtonColor: "#d33"
        });
        setLoading(false);
        return;
      }

      // 2. LƯU CHÌA KHÓA RIÊNG (Tránh đụng độ với User)
      localStorage.setItem("admin-token", token);
      localStorage.setItem("admin-role", "ADMIN");

      // 3. THÀNH CÔNG
    await Swal.fire({ // Thêm await ở đây
      icon: "success",
      title: "XÁC THỰC THÀNH CÔNG",
      text: "Đang chuyển hướng vào hệ thống...",
      timer: 1500,
      showConfirmButton: false,
      background: "#1e293b",
      color: "#fff"
    });
console.log("Chuẩn bị navigate...");
    // Phải đợi thông báo chạy xong hoặc tắt đi mới navigate
    navigate("/admin");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "THẤT BẠI",
        text: err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background blobs cho sinh động */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h2 style={styles.title}>ADMIN PORTAL</h2>
          <p style={styles.subtitle}>Hệ thống quản lý mỹ phẩm nội bộ</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL QUẢN TRỊ</label>
            <input
              type="email"
              placeholder="Nhập email admin..."
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>MẬT KHẨU</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "ĐĂNG NHẬP HỆ THỐNG"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <button onClick={() => navigate("/")} style={styles.backLink}>
            <i className="bi bi-arrow-left"></i> Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS cho sinh động
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a", // Nền tối sâu
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Segoe UI', Roboto, sans-serif"
  },
  blob1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    borderRadius: "50%",
    filter: "blur(80px)",
    top: "-100px",
    left: "-100px",
    opacity: 0.5,
    zIndex: 0
  },
  blob2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    borderRadius: "50%",
    filter: "blur(80px)",
    bottom: "-50px",
    right: "-50px",
    opacity: 0.4,
    zIndex: 0
  },
  glassCard: {
    width: "400px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndex: 1,
    textAlign: "center"
  },
  iconCircle: {
    width: "60px",
    height: "60px",
    background: "#3b82f6",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "24px",
    color: "#fff",
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
  },
  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "1px",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "30px"
  },
  form: {
    textAlign: "left"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  label: {
    color: "#cbd5e1",
    fontSize: "11px",
    fontWeight: "bold",
    marginBottom: "8px",
    display: "block",
    letterSpacing: "0.5px"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#fff",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "transform 0.2s ease, background 0.2s ease",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)"
  },
  footer: {
    marginTop: "25px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "20px"
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    width: "100%"
  }
};

export default AdminLogin;