import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';

const IMAGE_BASE_URL = "http://localhost:8080/api/public/products/image";

const ProductNew = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productService.getAllProducts(0, 20);
      setAllProducts(res.content || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  const ProductItem = ({ p }) => {
    const productId = p.productId || p.product_id;
    return (
      <div className={showAll ? "col-xl-3 col-lg-4 col-md-6 col-6 mb-4" : "flex-shrink-0"} 
           style={!showAll ? { width: '280px', marginRight: '20px' } : {}}>
        <div className="card h-100 border-0 shadow-sm hover-up overflow-hidden">
          <div className="p-3 text-center bg-white">
            <Link to={`/product/${productId}`}>
              <img
                src={`${IMAGE_BASE_URL}/${p.image}`}
                alt={p.productName}
                onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/679/679922.png")}
                className="img-fluid"
                style={{ height: "180px", objectFit: "contain" }}
              />
            </Link>
          </div>
          <div className="card-body p-3">
            <Link to={`/product/${productId}`} className="text-dark fw-bold text-decoration-none d-block mb-1 text-truncate">
              {p.productName}
            </Link>
            <div className="text-danger fw-bold mb-2">
              {p.price?.toLocaleString()} ₫
            </div>
            <div className="d-flex justify-content-between align-items-center small text-muted">
              <span>Còn: {p.quantity}</span>
              <span className="text-warning"><i className="fa fa-star"></i> 5.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content-wrapper bg-light pb-5">
      <section className="container pt-5">
        <div className="d-flex justify-content-between align-items-center mb-4 border-start border-4 border-primary ps-3">
          <div>
            <h3 className="fw-bold mb-0 text-uppercase">Sản phẩm cho bạn</h3>
            <p className="text-muted mb-0">Khám phá thế giới mỹ phẩm</p>
          </div>
          {!showAll && (
            <button 
              className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
              onClick={() => setShowAll(true)}
            >
              Xem tất cả <i className="fa fa-arrow-right ms-1"></i>
            </button>
          )}
        </div>

        {showAll ? (
          <div className="row animate__animated animate__fadeIn">
            {allProducts.map((p, i) => <ProductItem key={i} p={p} />)}
          </div>
        ) : (
          /* ĐỔI CLASS SANG no-scrollbar */
          <div className="d-flex overflow-auto pb-4 no-scrollbar">
            {allProducts.map((p, i) => <ProductItem key={i} p={p} />)}
          </div>
        )}

        {showAll && (
          <div className="text-center mt-4">
            <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => setShowAll(false)}>
              Thu gọn <i className="fa fa-chevron-up ms-1"></i>
            </button>
          </div>
        )}
      </section>

      <style>{`
        .hover-up { transition: all 0.3s; }
        .hover-up:hover { transform: translateY(-5px); }
        
        /* ẨN THANH TRƯỢT */
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
          display: flex;
          flex-wrap: nowrap;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default ProductNew;