import React from "react";
import { Routes, Route, Outlet } from "react-router-dom"; // Thêm Outlet
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ScrollToTop from "./layouts/ScrollToTop";
// Layouts
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Main from "./layouts/Main";

// Pages User
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProductList from "./pages/product/ProductList";
import ProductDetail from "./pages/product/ProductDetail";
import ProductCart from "./pages/cart/ProductCart";
import Checkout from "./pages/order/CheckOut";
import OrderList from "./pages/order/OrderList";
import PaymentSuccess from "./pages/order/PaymentSuccess";
import GeminiChat from "./pages/auth/GeminiChat";

// Admin
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import ProductListAD from "./pages/admin/products/ProductListAD";
import CategoryListAD from "./pages/admin/categories/CategoryListAD";
import OrderListAD from "./pages/admin/orders/OrderListAD";
// Thành phần Layout cho User để tái sử dụng Header/Footer
const UserLayout = () => (
  <>
    <Header />
    {/* Thêm transition nhẹ khi chuyển trang nếu muốn */}
    <div style={{ minHeight: "80vh" }}>
      <Outlet /> 
    </div>
    <GeminiChat/>
    <Footer />
  </>
);

function App() {
  return (
    <>
      <ScrollToTop />
      
      <Routes>
        {/* 1. TRANG LOGIN ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 2. GIAO DIỆN ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductListAD />} />
          <Route path="categories" element={<CategoryListAD />} />
          <Route path="orders" element={<OrderListAD />} />
        </Route>

        {/* 3. GIAO DIỆN USER */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Main />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="product" element={<ProductList />} />
          <Route path="category/:categoryId" element={<ProductList />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="cart" element={<ProductCart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={
            <div className="text-center py-5">
              <h2 className="display-1 fw-bold text-muted">404</h2>
              <p className="fs-4">Trang này không tồn tại rồi bạn ơi! 😅</p>
            </div>
          } />
        </Route>
      </Routes>
    </>
  );
}
export default App;