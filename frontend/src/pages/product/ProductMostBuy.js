import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';

const IMAGE_BASE_URL = "https://java-lbdz.onrender.com/api/public/products/image";

const ProductMostBuy = () => {
  const [mostBought, setMostBought] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    calculateMostBought();
  }, []);

  const calculateMostBought = async () => {
    setLoading(true);
    try {
      // 1. Lấy toàn bộ đơn hàng để tính toán
      const res = await orderService.getAllOrders();
      const orders = res.content || res || [];

      // 2. Logic gom nhóm tính tổng số lượng bán
      const stats = {};
      orders.forEach(order => {
        order.orderItems?.forEach(item => {
          const p = item.product;
          if (!p) return;
          const pId = p.productId;
          if (stats[pId]) {
            stats[pId].totalSold += item.quantity;
          } else {
            stats[pId] = { ...p, totalSold: item.quantity };
          }
        });
      });

      // 3. Sắp xếp giảm dần và lấy top 20
      const sorted = Object.values(stats)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 20);

      setMostBought(sorted);
    } catch (err) {
      console.error('Lỗi tính toán sản phẩm bán chạy:', err);
    } finally {
      setLoading(false);
    }
  };

  const ProductItem = ({ p, index }) => {
    const productId = p.productId || p.product_id;
    return (
      <div 
        className={showAll ? "col-xl-3 col-lg-4 col-md-6 col-6 mb-4" : "flex-shrink-0"} 
        style={!showAll ? { width: '260px', marginRight: '16px' } : {}}
      >
        <div className="card h-100 border-0 shadow-sm hover-up overflow-hidden" style={{ borderRadius: '15px' }}>
          {/* Badge Top Ranking */}
          <div className="position-absolute top-0 start-0 m-2 z-index-1">
            <span className={`badge rounded-pill ${index === 0 ? 'bg-danger' : 'bg-warning'} shadow`}>
              Top {index + 1}
            </span>
          </div>

          <div className="img-container bg-white p-3 text-center" style={{ height: "200px" }}>
            <Link to={`/product/${productId}`}>
              <img
                src={`${IMAGE_BASE_URL}/${p.image}`}
                alt={p.productName}
                onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/679/679922.png")}
                className="img-fluid h-100 transition-zoom"
                style={{ objectFit: "contain" }}
              />
            </Link>
          </div>

          <div className="card-body p-3 bg-white">
            <Link to={`/product/${productId}`} className="text-dark fw-bold text-decoration-none d-block mb-1 text-truncate">
              {p.productName}
            </Link>
            
            <div className="text-danger fw-bold mb-2">
              {p.price?.toLocaleString()} ₫
            </div>

            <div className="d-flex justify-content-between align-items-center small text-muted mt-auto">
              <span>🔥 Đã bán: <b className="text-dark">{p.totalSold}</b></span>
              <span className="text-warning"><i className="fas fa-star me-1"></i>5.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white pb-5">
      <section className="container pt-5">
        {/* Header Section giống hệt Sold */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="border-start border-4 border-danger ps-3">
            <h3 className="fw-bold mb-0 text-dark text-uppercase">Bán chạy nhất</h3>
            <p className="text-muted small mb-0">Xu hướng mua sắm hot nhất tuần qua</p>
          </div>
          
          <button 
            className={`btn ${showAll ? 'btn-outline-secondary' : 'btn-danger'} btn-sm rounded-pill px-4 fw-bold shadow-sm`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>Thu gọn <i className="fas fa-chevron-up ms-1"></i></>
            ) : (
              <>Xem tất cả <i className="fas fa-arrow-right ms-1"></i></>
            )}
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
        ) : (
          <div className={showAll ? "row animate__animated animate__fadeIn" : "d-flex overflow-auto pb-4 no-scrollbar"}>
            {mostBought.map((p, i) => <ProductItem key={i} p={p} index={i} />)}
          </div>
        )}

        {mostBought.length === 0 && !loading && (
          <p className="text-center text-muted py-5">Chưa có dữ liệu bán hàng.</p>
        )}
      </section>

      {/* Tái sử dụng style của mày */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }
        .hover-up { transition: all 0.3s; }
        .hover-up:hover { 
            transform: translateY(-8px); 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .transition-zoom { transition: transform 0.5s ease; }
        .hover-up:hover .transition-zoom { transform: scale(1.1); }
      `}</style>
    </div>
  );
};

export default ProductMostBuy;