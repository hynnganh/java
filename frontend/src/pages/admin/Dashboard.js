import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ShoppingCart, Package, DollarSign, TrendingUp, AlertTriangle, PieChart, RefreshCcw, ArrowUpRight } from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Đăng ký tất cả các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra quyền Admin
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role === "ADMIN" ? token : null;
    } catch { return null; } // Xử lý lỗi decode token
  }, []);

  // Fetch dữ liệu (ORDERS và PRODUCTS) từ API
  const fetchData = useCallback(async () => {
    const token = checkAuth();
    if (!token) { navigate("/admin/login"); return; } // Nếu không có token hoặc không phải admin, chuyển hướng
    try {
      setLoading(true);
      // Fetch số lượng lớn hơn để dữ liệu tính toán tổng thể chính xác hơn
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/admin/orders?pageSize=5000", { headers: { Authorization: `Bearer ${token}` } }), // Lấy nhiều hơn
        api.get("/admin/products?pageSize=5000", { headers: { Authorization: `Bearer ${token}` } }) // Lấy nhiều hơn
      ]);
      setOrders(ordersRes.data.content || []);
      setProducts(productsRes.data.content || []);
    } catch (err) {
      console.error("❌ Dashboard Data Fetch Error:", err);
      // Xử lý lỗi API (ví dụ: token hết hạn)
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("admin-token");
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [checkAuth, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== LOGIC TỰ TÍNH TOÁN DỮ LIỆU TẠI FRONTEND (Sử dụng useMemo để tối ưu hiệu suất) ====================

  // 1. Tính toán các chỉ số thống kê tổng quan (Doanh thu, Đơn hàng, Sản phẩm tồn kho thấp)
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) =>
      order.orderStatus !== 'CANCELLED' ? sum + (order.totalAmount || 0) : sum, 0);

    const lowStockCount = products.filter(p => p.quantity < 10).length;

    return {
      totalRevenue: totalRevenue,
      totalOrders: orders.length,
      lowStockProductsCount: lowStockCount,
      // Có thể thêm: totalProducts: products.length, totalCustomers: ... (nếu có user data)
    };
  }, [orders, products]);

  // 2. Lấy danh sách sản phẩm bán chạy nhất
const topSellingProducts = useMemo(() => {
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'SHIPPED') {
        order.orderItems?.forEach(item => {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { 
                name: item.productName, 
                sold: 0, 
                // SỬA Ở ĐÂY: Lấy từ item.product.image
                image: item.product?.image 
            };
          }
          productSalesMap[item.productId].sold += item.quantity;
        });
      }
    });
    return Object.values(productSalesMap).sort((a, b) => b.sold - a.sold).slice(0, 4);
}, [orders]);

  // 3. Dữ liệu cho biểu đồ tròn (Doughnut Chart) về trạng thái đơn hàng
  const orderStatusChartData = useMemo(() => {
    const counts = { PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    orders.forEach(order => {
      if (counts.hasOwnProperty(order.orderStatus)) {
        counts[order.orderStatus]++;
      }
    });

    return {
      labels: ['Chờ duyệt', 'Đang giao', 'Thành công', 'Đã hủy'],
      datasets: [{
        data: [counts.PENDING, counts.SHIPPED, counts.DELIVERED, counts.CANCELLED],
        backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#dc3545'], // Màu sắc sinh động
        borderColor: '#ffffff', // Viền trắng tạo hiệu ứng nổi
        borderWidth: 2,
        hoverOffset: 15, // Hiệu ứng phóng to khi hover
        borderRadius: 8, // Bo góc cho từng phần
        spacing: 5 // Khoảng cách giữa các phần
      }]
    };
  }, [orders]);

  // 4. Dữ liệu cho biểu đồ đường (Line Chart) về doanh thu theo tháng (Dữ liệu mẫu, cần thay bằng dữ liệu thật)
  const monthlyRevenueChartData = useMemo(() => {
    // Đây là phần cần Backend cung cấp dữ liệu thật nếu muốn chính xác
    // Ví dụ: Backend trả về { "2026-01": 12000000, "2026-02": 19000000, ... }
    const sampleRevenue = [12000000, 19000000, 15000000, 22000000, 18000000, 25000000]; // Dữ liệu mẫu
    const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0-11)
    const labels = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - (5 - i) + 12) % 12; // 6 tháng gần nhất
        return `T${monthIndex + 1}`;
    });

    return {
      labels: labels,
      datasets: [
        {
          fill: true,
          label: "Doanh thu",
          data: sampleRevenue,
          borderColor: "rgba(78, 115, 223, 1)", // Màu xanh chủ đạo
          backgroundColor: "rgba(78, 115, 223, 0.1)", // Màu nền gradient nhẹ
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          tension: 0.4, // Đường cong mượt mà
          borderWidth: 3,
        },
      ],
    };
  }, []);

  // Các tùy chọn cho biểu đồ đường
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'K'); // Đơn vị tiền tệ
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      },
    },
    animation: { // Thêm animation khi load biểu đồ
        duration: 1500,
        easing: 'easeOutQuart'
    }
  };


  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light-gradient">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="ms-3 fw-bold text-primary">Đang tải dữ liệu, chờ chút nhé...</p>
    </div>
  );

  return (
    <div className="p-4" style={{ backgroundColor: "#F4F7FC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header with Refresh Button */}
      <div className="d-flex justify-content-between align-items-center mb-5 fade-in">
        <div>
          <h2 className="fw-bold text-dark m-0 animate-text-in" style={{ letterSpacing: "-1.5px" }}>Tổng quan Cửa hàng</h2>
          <p className="text-muted small m-0 animate-text-in delay-1">Cập nhật mọi thứ đang diễn ra trong thời gian thực.</p>
        </div>
        <button className="btn btn-white border shadow-sm rounded-pill px-4 py-2 hover-scale-btn animate-in delay-2" onClick={fetchData}>
          <RefreshCcw size={16} className="me-2 spin-on-hover" /> Làm mới dữ liệu
        </button>
      </div>

      {/* 3 Main Stat Cards - Gradient Background & Hover Effects */}
      <div className="row g-4 mb-5">
        <ModernStatCard 
          title="Tổng Doanh Thu" 
          value={`${stats.totalRevenue.toLocaleString()}đ`} 
          icon={<DollarSign size={28} strokeWidth={2.5}/>} 
          colorStart="#6F86D6" 
          colorEnd="#48C6EF" 
          trend="+12.5%" 
        />
        <ModernStatCard 
          title="Số Đơn Hàng" 
          value={stats.totalOrders} 
          icon={<ShoppingCart size={28} strokeWidth={2.5}/>} 
          colorStart="#13A89E" 
          colorEnd="#2FE09A" 
          trend="+3.2%" 
        />
        <ModernStatCard 
          title="Sản phẩm tồn kho thấp" 
          value={stats.lowStockProductsCount} 
          icon={<AlertTriangle size={28} strokeWidth={2.5}/>} 
          colorStart="#FF4B2B" 
          colorEnd="#FF416C" 
          trend="Cảnh báo gấp" 
          isWarning={stats.lowStockProductsCount > 0} 
        />
      </div>

      <div className="row g-4">
        {/* Biểu đồ Doanh thu theo tháng */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4 p-4 h-100 animate-in">
            <h6 className="fw-bold mb-4 d-flex align-items-center text-primary"><TrendingUp size={20} className="me-2"/> Biểu đồ Doanh Thu</h6>
            <div style={{ height: "350px" }}>
              <Line data={monthlyRevenueChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Biểu đồ Tỉ lệ đơn hàng */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg rounded-4 p-4 h-100 animate-in delay-1">
            <h6 className="fw-bold mb-4 d-flex align-items-center text-success"><PieChart size={20} className="me-2"/> Tỷ lệ trạng thái đơn</h6>
            <div style={{ height: "260px", position: "relative" }}>
              <Doughnut data={orderStatusChartData} options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
                animation: { duration: 1500, easing: 'easeOutQuart' } // Animation cho biểu đồ tròn
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-4">
        {/* Top Sản phẩm bán chạy */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 p-4 h-100 animate-in delay-2">
            <h6 className="fw-bold mb-4 d-flex align-items-center text-info"><TrendingUp size={20} className="me-2"/> Sản phẩm bán chạy nhất</h6>
            {topSellingProducts.length > 0 ? (
              <div className="list-group list-group-flush">
                {topSellingProducts.map((product, index) => (
                  <div key={index} className="list-group-item px-0 border-0 d-flex align-items-center py-2 hover-grow">
                    <span className="me-3 fw-bold text-secondary text-lg">#{index + 1}</span>
                    <img 
                        src={`http://localhost:8080/api/public/products/image/${product.image || (product.product && product.product.image)}`} 
                        className="rounded-2 me-3" 
                        alt="" 
                        style={{width: "45px", height:"45px", objectFit:"cover"}}
                        onError={(e) => e.target.src = "https://via.placeholder.com/45?text=No+Img"} 
                      />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark mb-0">{product.name}</div>
                      <div className="text-muted small">Đã bán: {product.sold} sản phẩm</div>
                    </div>
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">Chi tiết</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-4">Chưa có sản phẩm bán chạy.</p>
            )}
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 p-4 h-100 animate-in delay-3">
            <h6 className="fw-bold mb-4 d-flex align-items-center text-danger"><Package size={20} className="me-2"/> Cảnh báo Tồn kho thấp</h6>
            {products.filter(p => p.quantity < 10).length > 0 ? (
              <div className="overflow-auto custom-scroll" style={{maxHeight: "300px"}}>
                {products.filter(p => p.quantity < 10).map((product) => (
                  <div key={product.productId} className="d-flex justify-content-between align-items-center mb-3 p-3 bg-red-light rounded-3 border-start border-danger border-4 hover-lift">
                    <div className="d-flex align-items-center">
                      <img src={`http://localhost:8080/api/public/products/image/${product.image}`} 
                           className="rounded-2 me-3" 
                           alt={product.name} 
                           style={{width: "45px", height:"45px", objectFit:"cover"}} />
                      <div>
                        <div className="small fw-bold text-dark">{product.productName}</div>
                        <div className="smaller text-danger">Chỉ còn: <span className="fw-bold">{product.quantity}</span></div>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => navigate('/admin/products')}>Xem</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-4">Tất cả sản phẩm trong kho đều ổn định.</p>
            )}
          </div>
        </div>
      </div>

      {/* GLOBAL STYLES FOR MODERN LOOK */}
      <style>{`
        /* --- General Styling --- */
        body { font-family: 'Inter', sans-serif; background-color: #F4F7FC; }
        .text-dark { color: #212529 !important; }
        .text-muted { color: #6c757d !important; }
        .fw-bold { font-weight: 700 !important; }
        .rounded-pill { border-radius: 50rem !important; }
        .rounded-3 { border-radius: 0.75rem !important; }
        .rounded-4 { border-radius: 1.5rem !important; } /* Big rounded corners */
        .shadow-lg { box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.08) !important; }
        .shadow-sm { box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075)!important; }
        .btn-white { background-color: #ffffff; color: #333; border-color: #e0e0e0; }
        .btn-white:hover { background-color: #f8f9fa; border-color: #c0c0c0; }

        /* --- Animations --- */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        .animate-in.delay-1 { animation-delay: 0.2s; }
        .animate-in.delay-2 { animation-delay: 0.4s; }
        .animate-in.delay-3 { animation-delay: 0.6s; }
        .animate-text-in { animation: fadeIn 0.7s ease-out forwards; opacity: 0; transform: translateY(10px); }
        .animate-text-in.delay-1 { animation-delay: 0.1s; }

        .hover-scale-btn:hover { transform: scale(1.05); transition: transform 0.2s ease-out; }
        .spin-on-hover { transition: transform 0.3s ease-in-out; }
        .hover-scale-btn:hover .spin-on-hover { transform: rotate(360deg); }

        .hover-grow:hover { transform: scale(1.02); background-color: #f3f4f6; transition: all 0.2s ease-out; cursor: pointer; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important; transition: all 0.2s ease-out; cursor: pointer; }

        .product-thumbnail { transition: transform 0.2s ease-out; }
        .product-thumbnail:hover { transform: scale(1.1); }
        
        /* --- Specific Colors & Styles --- */
        .bg-red-light { background-color: #fff4f4 !important; } /* Tông đỏ nhẹ cho cảnh báo */
        .text-lg { font-size: 1.25rem; }
        .smaller { font-size: 0.75rem; } /* 12px */

        /* Custom Scrollbar for Inventory Alert */
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

// Component thẻ thống kê riêng biệt với Gradient và Icon lớn
const ModernStatCard = ({ title, value, icon, colorStart, colorEnd, trend, isWarning }) => (
  <div className="col-md-4 animate-in">
    <div className="card border-0 shadow-lg rounded-4 p-4 h-100 stat-card-gradient hover-lift" 
         style={{ background: `linear-gradient(45deg, ${colorStart}, ${colorEnd})` }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="p-3 rounded-circle d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
          {icon}
        </div>
        <span className={`badge ${isWarning ? 'bg-danger' : 'bg-white text-dark'} rounded-pill px-3 py-2 fw-semibold`}>
          {isWarning ? <AlertTriangle size={14} className="me-1" /> : <ArrowUpRight size={14} className="me-1" />}
          {trend}
        </span>
      </div>
      <p className="text-white small fw-bold mb-1 text-uppercase opacity-75" style={{ letterSpacing: "1px" }}>{title}</p>
      <h3 className="fw-bold text-white m-0" style={{ fontSize: "2.25rem" }}>{value}</h3>
    </div>
  </div>
);

export default Dashboard;