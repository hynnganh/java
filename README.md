"# java" 
# E-Commerce Cart Management System (Anh05)

Hệ thống quản lý giỏ hàng thương mại điện tử hoàn chỉnh, xây dựng trên kiến trúc **Full-stack** hiện đại với Java Spring Boot và ReactJS.

---

## Kiến trúc & Công nghệ (Tech Stack)

Hệ thống được thiết kế theo mô hình **Client-Server** tách biệt nhằm tối ưu hóa khả năng mở rộng và bảo trì.

* **Backend (Java):** * Framework: Spring Boot 3.x.
    * Security: Spring Security + JWT (Stateless Authentication).
    * Data: Spring Data JPA (Hibernate).
* **Frontend (JavaScript):**
    * Library: ReactJS & React-Admin.
    * API Client: Axios.

---

## Hướng dẫn Cài đặt & Khởi chạy

### 1. Backend (Java Spring Boot)
1. **Cấu hình:** Mở file `src/main/resources/application.properties` để chỉnh sửa thông tin Database.
2. **Chạy ứng dụng:** Sử dụng lệnh `mvn spring-boot:run`.
3. **Địa chỉ:** API Server chạy tại `http://localhost:8080`.

### 2. Frontend (ReactJS)
1. **Cài đặt:** Truy cập thư mục frontend và chạy `npm install`.
2. **Khởi chạy:** Chạy lệnh `npm start`.
3. **Địa chỉ:** Giao diện chạy tại `http://localhost:3000`.

---

## Tài liệu API (API Documentation)
Dự án tích hợp Swagger giúp việc tra cứu và dùng thử API trở nên dễ dàng hơn. Sau khi khởi chạy Backend, bạn có thể truy cập tại:

**URL:** `http://localhost:8080/swagger-ui/index.html`

| Method | Endpoint | Mô tả | Role |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Đăng nhập lấy Token | Public |
| **GET** | `/api/admin/orders` | Danh sách đơn hàng | Admin |
| **GET** | `/api/admin/orders/{id}` | Chi tiết đơn hàng | Admin |
| **DELETE**| `/api/admin/orders/{id}` | Xóa đơn hàng | Admin |

---

## Dữ liệu mẫu (Seed Data)

* **Tự động:** Hệ thống sử dụng file `ngocanhjava.sql` trong thư mục `DoAn`.
* **Tài khoản Test:**
    * **Admin:** `anhbebong@gmail.com` / Pass: `ngocanhhh23`.
    * **User:** `anhbebong@gmail.com` / Pass: `ngocanhhh23`.

---

##  Quy trình Quản lý Mã nguồn (Git)

Dự án sử dụng Git để quản lý phiên bản với các quy tắc đơn giản:

1. **Commit Message:** Viết ngắn gọn, rõ ràng theo cấu trúc:
   - `feat:` Cho tính năng mới
   - `fix:` Cho sửa lỗi
   - `docs:` Cho việc sửa tài liệu/README.

2. **Quy trình đẩy code:**
   - Kiểm tra trạng thái: `git status`
   - Lưu thay đổi: `git add .`
   - Xác nhận: `git commit -m "mô tả"`
   - Đẩy lên GitHub: `git push origin main`

## Tác giả
* **Sinh viên:** Huỳnh Thị Ngọc Ánh - 2123110154
* **Project:** Thiết kế Website Mỹ Phẩm
