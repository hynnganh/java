import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';

const ProductMostViewed = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMostViewedProducts();
  }, []);

  const fetchMostViewedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getMostViewedProducts(0, 8);
      setProducts(response.content || []);
    } catch (err) {
      console.error('❌ Lỗi khi lấy sản phẩm xem nhiều:', err);
      setError('Không thể tải sản phẩm xem nhiều');
    } finally {
      setLoading(false);
    }
  };

  const IMAGE_BASE_URL = "http://localhost:8080/api/public/products/image";

  if (loading) {
    return (
      <section className="padding-bottom container mt-5">
        <header className="section-heading mb-4 text-center">
          <h3 className="title-section text-uppercase fw-bold text-primary">
            👁️ Sản phẩm xem nhiều
          </h3>
        </header>
        
        <div className="row">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4">
              <div className="card card-product-grid shadow-sm h-100">
                <div className="img-wrap">
                  <div 
                    style={{
                      width: "100%",
                      height: "250px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-wrap p-3">
                  <div className="placeholder-glow">
                    <span className="placeholder col-8 mb-2"></span>
                    <span className="placeholder col-6 mb-2"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="padding-bottom container mt-5">
        <header className="section-heading mb-4 text-center">
          <h3 className="title-section text-uppercase fw-bold text-primary">
            👁️ Sản phẩm xem nhiều
          </h3>
        </header>
        
        <div className="text-center py-5">
          <h4>❌ Lỗi khi tải sản phẩm</h4>
          <p className="text-muted">{error}</p>
          <button 
            onClick={fetchMostViewedProducts}
            className="btn btn-primary mt-2"
          >
            🔄 Thử lại
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="padding-bottom container mt-5">
      <header className="section-heading mb-4 text-center">
        <h3 className="title-section text-uppercase fw-bold text-primary">
          👁️ Sản phẩm xem nhiều
        </h3>
        <p className="text-muted">Những sản phẩm được quan tâm nhất</p>
      </header>

      {/* 🧩 Hiển thị sản phẩm */}
      <div className="row">
        {products.map((p, index) => {
          const productId = p.productId || p.product_id;

          return (
            <div
              key={productId}
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
            >
              <div className="card card-product-grid shadow-sm h-100 position-relative">
                {/* Badge xếp hạng lượt xem */}
                {/* {index < 3 && (
                  <div 
                    className={`position-absolute top-0 start-0 m-2 badge ${
                      index === 0 ? 'bg-danger' : 
                      index === 1 ? 'bg-warning' : 'bg-info'
                    }`}
                    style={{ zIndex: 10 }}
                  >
                    {index === 0 ? '🔥' : index === 1 ? '⭐' : '👍'} Top {index + 1}
                  </div>
                )} */}

                {/* Badge lượt xem nổi bật */}
                <div 
                  className="position-absolute top-0 end-0 m-2 badge bg-primary"
                  style={{ zIndex: 10 }}
                >
                  👁️ {p.views || 0} lượt
                </div>

                <div className="img-wrap position-relative">
                  <Link
                    to={`/product/${productId}`}
                    className="text-decoration-none"
                  >
                    <img
                      src={`${IMAGE_BASE_URL}/${p.image}`}
                      alt={p.productName || p.product_name}
                      onError={(e) =>
                        (e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/679/679922.png")
                      }
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </Link>

                  {/* Badge giảm giá */}
                  {p.discount > 0 && (
                    <div className="bottom-24 start-0 m-2 badge bg-danger">
                      🔥 Giảm {p.discount}%
                    </div>
                  )}
                </div>

                <div className="info-wrap p-3 d-flex flex-column">
                  <Link
                    to={`/product/${productId}`}
                    className="text-decoration-none"
                  >
                    <h6 className="text-truncate text-dark fw-bold">
                      {p.productName || p.product_name}
                    </h6>
                  </Link>

                  <p className="text-muted small mb-2 flex-grow-1">
                    {p.description?.substring(0, 40) ||
                      "Đang cập nhật mô tả..."}
                  </p>

                  {/* Thông tin số lượng bán */}
                  <div className="mb-2">
                    <small className="text-muted">
                      📦 Đã bán: {p.sold || 0}
                    </small>
                  </div>

                  <div className="price-wrapper mb-1">
                    {p.specialPrice ? (
                      <>
                        <span className="price h5 text-danger mb-0">
                          {p.specialPrice.toLocaleString()} ₫
                        </span>
                        <span className="text-muted text-decoration-line-through small ms-2">
                          {p.price.toLocaleString()} ₫
                        </span>
                      </>
                    ) : (
                      <span className="price h5 text-danger mb-0">
                        {p.price.toLocaleString()} ₫
                      </span>
                    )}
                  </div>

                  {/* Trạng thái tồn kho */}
                  <small
                    className={`mt-1 ${
                      p.quantity === 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {p.quantity === 0
                      ? "❌ Hết hàng"
                      : `📦 Còn ${p.quantity} sản phẩm`}
                  </small>

                  {/* Nút hành động */}
                  <div className="d-grid gap-2 mt-3">
                    <Link 
                      to={`/product/${productId}`}
                      className={`btn btn-primary btn-sm ${
                        p.quantity === 0 ? 'disabled' : ''
                      }`}
                    >
                      {p.quantity === 0 ? 'Hết hàng' : '🛒 Mua ngay'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📭 Không có sản phẩm */}
      {!loading && products.length === 0 && (
        <div className="text-center py-5">
          <h4>📭 Không có sản phẩm xem nhiều</h4>
          <p className="text-muted">
            Hiện chưa có sản phẩm nào được xem nhiều.
          </p>
          <button
            onClick={fetchMostViewedProducts}
            className="btn btn-primary mt-2"
          >
            🔄 Tải lại
          </button>
        </div>
      )}

      {/* Nút xem thêm */}
      {/* {products.length > 0 && (
        <div className="text-center mt-4">
          <Link to="/product/most-viewed" className="btn btn-outline-primary">
            📋 Xem tất cả sản phẩm xem nhiều
          </Link>
        </div>
      )} */}
    </section>
  );
};

export default ProductMostViewed;