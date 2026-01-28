"# java" 
# 🛒 E-Commerce Cart Management System (Anh05)

Hệ thống quản lý giỏ hàng thương mại điện tử hoàn chỉnh, xây dựng trên kiến trúc **Full-stack** hiện đại với Java Spring Boot và ReactJS.

---

## 🏗️ Kiến trúc & Công nghệ (Tech Stack)

Hệ thống được thiết kế theo mô hình **Client-Server** tách biệt nhằm tối ưu hóa khả năng mở rộng và bảo trì.

* **Backend (Java):** * Framework: Spring Boot 3.x.
    * Security: Spring Security + JWT (Stateless Authentication).
    * Data: Spring Data JPA (Hibernate).
* **Frontend (JavaScript):**
    * Library: ReactJS & React-Admin.
    * API Client: Axios.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Backend (Java Spring Boot)
1. **Cấu hình:** Mở file `src/main/resources/application.properties` để chỉnh sửa thông tin Database.
2. **Chạy ứng dụng:** Sử dụng lệnh `mvn spring-boot:run`.
3. **Địa chỉ:** API Server chạy tại `http://localhost:8080`.

### 2. Frontend (ReactJS)
1. **Cài đặt:** Truy cập thư mục frontend và chạy `npm install`.
2. **Khởi chạy:** Chạy lệnh `npm start`.
3. **Địa chỉ:** Giao diện chạy tại `http://localhost:3000`.

---

## 📖 Tài liệu API (API Documentation)

Hệ thống sử dụng **JWT Token** để bảo mật. Các yêu cầu đến vùng `/api/admin/**` cần kèm theo Header: `Authorization: Bearer <Token>`.

| Method | Endpoint | Mô tả | Role |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Đăng nhập lấy Token | Public |
| **GET** | `/api/admin/carts` | Danh sách giỏ hàng | Admin |
| **GET** | `/api/admin/carts/{id}` | Chi tiết giỏ hàng | Admin |
| **DELETE**| `/api/admin/carts/{id}` | Xóa giỏ hàng | Admin |

---

## 🧪 Dữ liệu mẫu (Seed Data)

* **Tự động:** Hệ thống sử dụng file `data.sql` trong thư mục `resources` để tự động chèn dữ liệu khi khởi động.
* **Tài khoản Test:**
    * **Admin:** `anhbebong@gmail.com` / Pass: `ngocanhhh23`.
    * **User:** `user@gmail.com` / Pass: `123456`.

---

## 🌲 Quy trình Git (Git Flow)

Dự án tuân thủ quy trình quản lý mã nguồn chuyên nghiệp:
* **Commit:** Sử dụng thông điệp rõ ràng theo từng tính năng (ví dụ: `feat: add JWT security filter`).
* **Branch:** Chia nhánh `main` cho bản ổn định và `feature/` cho các tính năng mới.
* **PR (Pull Request):** Kiểm tra mã nguồn kỹ lưỡng trước khi gộp (merge) vào nhánh chính.

---

## 👨‍💻 Tác giả
* **Sinh viên:** Ngọc Anh
* **Project:** Anh05 Application