import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Layers, 
  Users, 
  ShoppingCart, 
  LogOut, 
  ChevronRight 
} from "lucide-react";
import Dashboard from "./Dashboard";
import ProductListAD from "./products/ProductListAD";
import CategoryListAD from "./categories/CategoryListAD";
import OrderListAD from "./orders/OrderListAD";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      
      {/* SIDEBAR */}
      <aside className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: "260px" }}>
        <div className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-5 fw-bold letter-spacing-1">COSMETIC ADMIN</span>
        </div>
        <hr />
        
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <SidebarLink to="/admin" icon={<LayoutDashboard size={20} />} text="Tổng quan" active={isActive("/admin")} />
          </li>
          <li>
            <SidebarLink to="/admin/products" icon={<Box size={20} />} text="Sản phẩm" active={isActive("/admin/products")} />
          </li>
          <li>
            <SidebarLink to="/admin/categories" icon={<Layers size={20} />} text="Danh mục" active={isActive("/admin/categories")} />
          </li>
          <li>
            <SidebarLink to="/admin/orders" icon={<ShoppingCart size={20} />} text="Đơn hàng" active={isActive("/admin/orders")} />
          </li>
        </ul>
        
        <hr />
        <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 w-100 py-2">
          <LogOut size={18} />
          <span>Thoát hệ thống</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="d-flex flex-column flex-grow-1 bg-light" style={{ minWidth: 0 }}>
        
        {/* HEADER */}
        <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 shadow-sm" style={{ height: "65px" }}>
          <div className="container-fluid p-0">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0 small">
                <li className="breadcrumb-item text-muted">Hệ thống</li>
                <li className="breadcrumb-item active fw-bold text-dark">
                  {location.pathname.replace("/admin/", "").toUpperCase() || "DASHBOARD"}
                </li>
              </ol>
            </nav>
            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-sm-block">
                <div className="fw-bold small">Quản trị viên</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>Trạng thái: Trực tuyến</div>
              </div>
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: "40px", height: "40px" }}>
                AD
              </div>
            </div>
          </div>
        </header>

        {/* NỘI DUNG CUỘN */}
        <main className="flex-grow-1 overflow-auto p-4">
          <div className="container-fluid p-0">
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="products" element={<ProductListAD />} />
              <Route path="categories" element={<CategoryListAD />} />
              <Route path="orders" element={<OrderListAD />} />
              <Route path="users" element={<Placeholder title="Quản lý khách hàng" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Component con Link Sidebar cho sạch
const SidebarLink = ({ to, icon, text, active }) => (
  <Link to={to} className={`nav-link d-flex align-items-center gap-3 py-3 rounded-0 transition-all ${active ? "active bg-primary text-white" : "text-white-50 opacity-75 hover-bg-light"}`}>
    {icon}
    <span className="flex-grow-1">{text}</span>
    {active && <ChevronRight size={14} />}
  </Link>
);

const Placeholder = ({ title }) => (
  <div className="card border-0 shadow-sm p-5 text-center">
    <h4 className="text-muted mb-0">{title}</h4>
    <p className="small text-secondary">Tính năng này đang được cập nhật dữ liệu...</p>
  </div>
);

export default AdminLayout;