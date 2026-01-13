import React from "react";
import { Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/sass/ui.scss";
import "./assets/sass/bootstrap.scss";
import "./assets/sass/responsive.scss";
import "./assets/fonts/fontawesome/css/all.min.css";

import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Main from "./layouts/Main";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProductList from "./pages/product/ProductList";
import ProductDetail from "./pages/product/ProductDetail";
import EditProfile from './pages/auth/EditProfile';
import ProductCart from './pages/cart/ProductCart';

import Checkout from "./pages/order/CheckOut";
import OrderList from "./pages/order/OrderList";

function App() {
  return (
    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<EditProfile />} />
        
        {/* Routes sản phẩm */}
        <Route path="/product" element={<ProductList />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        
        {/* Routes giỏ hàng - QUAN TRỌNG: sửa đường dẫn */}
        <Route path="/cart" element={<ProductCart />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderList />} />

        
        {/* Route fallback cho 404 */}
        <Route path="*" element={<div className="container mt-4 text-center"><h2>404 - Trang không tồn tại</h2></div>} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;