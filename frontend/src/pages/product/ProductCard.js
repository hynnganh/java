import React from 'react';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = "https://java-lbdz.onrender.com/api/public/products/image";

const ProductCard = ({ product, columnClass = "col-xl-3 col-lg-4 col-md-6 col-6" }) => {
  // Đồng bộ ID từ nhiều nguồn khác nhau (Backend có thể trả về id hoặc productId)
  const productId = product.productId || product.id;

  return (
    <div className={`${columnClass} mb-4`}>
      <div className="card h-100 border-0 shadow-sm product-card-hover rounded-4 overflow-hidden">
        {/* Badge Giảm Giá */}
        {product.discount > 0 && (
          <span className="badge bg-danger position-absolute top-0 start-0 m-3 z-1 shadow-sm">
            -{product.discount}%
          </span>
        )}

        {/* Hình ảnh sản phẩm */}
        <div className="position-relative text-center p-3 bg-white" style={{ minHeight: '220px' }}>
          <Link to={`/product/${productId}`}>
            <img
              src={product.image ? `${IMAGE_BASE_URL}/${product.image}` : "https://via.placeholder.com/200"}
              alt={product.productName}
              className="img-fluid transition-transform"
              style={{ height: "180px", objectFit: "contain" }}
              onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/679/679922.png")}
            />
          </Link>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="card-body d-flex flex-column p-3 pt-0">
          <Link 
            to={`/product/${productId}`} 
            className="text-dark fw-bold text-decoration-none d-block mb-1 text-truncate-2"
            title={product.productName}
          >
            {product.productName}
          </Link>
          
          <div className="mt-auto">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-danger fw-bold h5 mb-0">
                {(product.specialPrice || product.price).toLocaleString()} ₫
              </span>
              {product.specialPrice && (
                <del className="text-muted small">
                  {product.price.toLocaleString()} ₫
                </del>
              )}
            </div>

            {/* Nút thao tác */}
            <div className="d-grid">
              <Link 
                to={`/product/${productId}`} 
                className="btn btn-outline-primary btn-sm rounded-pill fw-bold py-2 shadow-none"
              >
                Chi tiết sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-card-hover {
          transition: all 0.3s ease;
        }
        .product-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.1) !important;
        }
        .product-card-hover:hover img {
          transform: scale(1.05);
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8em;
          line-height: 1.4em;
        }
        .transition-transform {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;